const Koa = require('koa');
const route = require('koa-route');
const cors = require('@koa/cors');

const { createLogger } = require('./middleware/logger')
const { createPostgraphile } = require('./middleware/postgraphile')
const { createVueSSR } = require('./middleware/vue_ssr')

const isProduction = (process.env._HANDLER || process.env.NODE_ENV === 'production')

const app = new Koa();

app.use(cors({ origin: '*' }))

createLogger(app);
createPostgraphile(app);

if (isProduction) {
  createVueSSR(app);
}

// app.use(route.get('/', (ctx,nxt) => {
//   ctx.body = "Hello World"
// }));
//console.log('stage', process.env.stage)

module.exports = app;