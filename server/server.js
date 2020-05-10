const Koa = require('koa');
const route = require('koa-route');

const { createLogger } = require('./middleware/logger')
const { createPostgraphile } = require('./middleware/postgraphile')
const { createVueSSR } = require('./middleware/vue_ssr')

const app = new Koa();

createLogger(app);
createPostgraphile(app);
createVueSSR(app);

app.use(route.all('*', (ctx,nxt) => {
  ctx.body = "Hello World"
}));

module.exports = app;