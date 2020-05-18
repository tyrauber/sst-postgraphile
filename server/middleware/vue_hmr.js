const Router = require('@koa/router');
const serve =  require('koa-static');
const mount = require('koa-mount');

const Path = require('path')
const fs = require('fs')

const VueServerRenderer = require('vue-server-renderer')


const createVueHMR = async (app) =>{
  
  const router = new Router();
  let renderer = null

  //******************************
  // Renderer Generator
  //******************************

  const generateRenderer = (fs) => {
    if (!fs) fs = require('fs')

    const serverBundlePath = Path.resolve(__dirname, '../../public/vue-ssr-server-bundle.json')
    const clientBundlePath = Path.resolve(__dirname, '../../public/vue-ssr-client-manifest.json')
    const templatePath = Path.resolve(__dirname, '../../app/index.html')

    return VueServerRenderer.createBundleRenderer(
      JSON.parse(fs.readFileSync(serverBundlePath, 'utf-8')),
      {
        clientManifest: JSON.parse(fs.readFileSync(clientBundlePath, 'utf-8')),
        // Always read the HTML template from the filesystem.
        runInNewContext: false,
        inject: false,
        template: require('fs').readFileSync(templatePath, 'utf-8')
      }
    )
  }

  if (process.env.NODE_ENV != 'test') {
    const Webpack = require('webpack')
    const WebpackDevMiddleware = require("koa-webpack-dev-middleware");
    const WebpackHotMiddleware = require("koa-webpack-hot-middleware");

    const [ webpackConfigServer, webpackConfigWeb ] = require('../../webpack.config')


    const webCompiler = Webpack(webpackConfigWeb)
    const serverCompiler = Webpack(webpackConfigServer)

    const devMiddleware = WebpackDevMiddleware(webCompiler, {
      logLevel: 'warn',
      publicPath: webpackConfigWeb.output.publicPath
    })

    const hotMiddleware = WebpackHotMiddleware(webCompiler, { log: false })

    app.use(devMiddleware)
    app.use(hotMiddleware)

    serverCompiler.outputFileSystem = devMiddleware.fileSystem

    webCompiler.hooks.beforeCompile.tap('Console Rest', () => {
      process.stdout.write('\x1Bc');
      console.info('Recompiling assets...')
    })

    webCompiler.hooks.afterEmit.tap('Web Compilation', (stats) => {
      process.stdout.write('\x1Bc');
      console.time('\nCompilation Time')

      console.info(`*** WEB COMPILATION COMPLETE ***\n`)
      console.group('Generated Assets')
      Object.keys(stats.assets).forEach(a => console.info(a))
      console.groupEnd()

      serverCompiler.run((err, stats) => {
        console.info(`\n*** SERVER COMPILATION COMPLETE *** \n`)
        console.group('Generated Assets')
        Object.keys(stats.compilation.assets).forEach(a => console.info(a))
        console.groupEnd()

        renderer = generateRenderer(devMiddleware.fileSystem)

        console.timeEnd('\nCompilation Time')
      })
    })
  }

  //******************************
  // Static Resource Serving
  //******************************

  app.use(mount(
    (process.env._HANDLER ? `/${process.env.stage}/public/` : '/public/'), 
    serve("./public/")
  ));

  //******************************
  // Catch-all Route
  //******************************

  // Because we delegate to Vue Router to determine if a particular route is serve-able,
  // at the Koa level we simply implement a catch-all.

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

module.exports.createVueHMR = createVueHMR