const Router = require('@koa/router');
const serve =  require('koa-static');
const mount = require('koa-mount');

const Path = require('path')
const fs = require('fs')

const VueServerRenderer = require('vue-server-renderer')

const isProduction = process.env.NODE_ENV === 'production'

const readFile = (path) =>{
  path = (process.env._HANDLER ? path : Path.resolve(__dirname, `./public/${path}`))
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

    const serverBundle = readFile('vue-ssr-server-bundle.json')
    const clientBundle= readFile('vue-ssr-client-manifest.json')
    const template = readFile('index.template.html')

    return VueServerRenderer.createBundleRenderer(
      JSON.parse(serverBundle),
      {
        clientManifest: JSON.parse(clientBundle),
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

  // app.use(mount(
  //   (isProduction ? `/public/` : `/${process.env.stage}/public/`), 
  //   serve("./public/")
  // ));


  //******************************
  // Catch-all Route
  //******************************

  router.get('(.*|/)', async (ctx, ctxnext) =>{

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