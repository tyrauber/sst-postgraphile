const Router = require('@koa/router');
const serve =  require('koa-static');
const mount = require('koa-mount');

const Path = require('path')
const fs = require('fs')

const VueServerRenderer = require('vue-server-renderer')

const isProduction = process.env.NODE_ENV === 'production'

const readFile = (path) =>{
  //path = isProduction ? path : `./public/${path}`
  //path = process.env._HANDLER ? path : Path.resolve(__dirname, `./${process.env.STAGE}/${path}`)

  path = Path.resolve(__dirname, `../../${path}`)
  return fs.readFileSync(path, 'utf-8')
}

const createVueSSR = async (app) =>{
  
  const router = new Router();
  let renderer = null

  //******************************
  // Renderer Generator
  //******************************

  const generateRenderer = () => {
    if (!fs) fs = require('fs')

    const serverBundle = require('../../public/vue-ssr-server-bundle.json')
    const clientBundle= require('../../public/vue-ssr-client-manifest.json')
    const template = require('../../public/index.html')

    return VueServerRenderer.createBundleRenderer(
      serverBundle,
      {
        clientManifest: clientBundle,
        runInNewContext: false,
        inject: false,
        template: template
      }
    )
  }

  renderer = generateRenderer()

  //******************************
  // Static Resource Serving
  //******************************

  const AWS = require('aws-sdk');
  const s3 = new AWS.S3();

  function getObject(bucket, objectKey){
    return new Promise((resolve,reject)=>{
      console.log("Asset", { Bucket: bucket, Key: objectKey })
      let stream =  s3
      .getObject({ Bucket: bucket, Key: objectKey })
      .createReadStream()
      let data = ''
      stream.on("error",err=>reject(err))
      stream.on("data",chunk=>data+=chunk)
      stream.on("end",()=>resolve(data))
    })
  }

  router.get(`(/public.*)`, async (ctx, next) =>{
    // console.log('asset', ctx.request.url)
    const key = ctx.request.url.replace(/^\//,'')
    const bucket = process.env.S3_BUCKET
    const type = key.match(/(png|jpg|jpeg|webp|tiff)$/)
    if (!!(type)){
      ctx.type = `image/${type[0]}`;
    }
    ctx.body = await getObject(bucket, key)
    next();
  })

  //******************************
  // Catch-all Route
  //******************************

  router.get('(.*|/[^])', async (ctx, ctxnext) =>{

    // In development, the renderer might take a second to generate.
    if (!renderer) {
      ctx.body = 'Renderer is being created, one moment....'
      ctx.status = 500
      return
    }

    await renderer.renderToString({ 
      url: ctx.request.url, title: '*'
    }).catch((err) =>{
      console.log("ERR", err)
      ctx.body = err.stack
      ctx.status = 500
    }).then((html) => {
      // console.log("html", html)
      ctx.body = html;
    })
  });

  app
    .use(router.routes())
    .use(router.allowedMethods());

}

module.exports.createVueSSR = createVueSSR