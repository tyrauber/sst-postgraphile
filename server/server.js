const Koa = require('koa');
const route = require('koa-route');

const { createLogger } = require('./middleware/logger')
const { createPostgraphile } = require('./middleware/postgraphile')

const app = new Koa();


createLogger(app);
createPostgraphile(app);

app.use(route.all('*', (ctx,nxt) => {
  ctx.body = "Hello World"
}));

module.exports = app;