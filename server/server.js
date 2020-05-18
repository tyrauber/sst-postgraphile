const Koa = require('koa');
const route = require('koa-route');
const cors = require('@koa/cors');
const serve =  require('koa-static');
const mount = require('koa-mount');
const Path = require('path')

const { createLogger } = require('./middleware/logger');
const { createPostgraphile } = require('./middleware/postgraphile');
const { createVueSSR } = require('./middleware/vue_ssr');
const { createVueHMR } = require('./middleware/vue_hmr');

const isProduction = (process.env._HANDLER || process.env.NODE_ENV === 'production')

const app = new Koa();

app.use(cors({ origin: '*' }))

createLogger(app);
createPostgraphile(app);

if (isProduction) {
  createVueSSR(app);
} else {
  createVueHMR(app);
}

// const dir = Path.resolve(__dirname, './public')
// console.log(dir)


// app.use(async (ctx, next) => {
//   await next();
//   ctx.body = 'Hello World';
// });

//app.use(serve(dir))
module.exports = app;