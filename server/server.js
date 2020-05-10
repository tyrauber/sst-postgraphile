const Koa = require('koa');
const route = require('koa-route');

const { createPostgraphile } = require('./middleware/postgraphile')

const app = new Koa();

createPostgraphile(app);

app.use(route.all('*', (ctx,nxt) => {
  ctx.body = "Hello World"
}));

module.exports = app;