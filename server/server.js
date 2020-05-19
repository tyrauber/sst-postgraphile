const Koa = require('koa');
const route = require('koa-route');
const koaBody = require('koa-body');
const cors = require('@koa/cors');
const serve =  require('koa-static');
const mount = require('koa-mount');

const Path = require('path')

const { createLogger } = require('./middleware/logger');
const { createUploader } = require('./middleware/uploader');
const { createPostgraphile } = require('./middleware/postgraphile');
const { createVueSSR } = require('./middleware/vue_ssr');
const { createVueHMR } = require('./middleware/vue_hmr');

const isProduction = (process.env._HANDLER || process.env.NODE_ENV === 'production')

const app = new Koa();

app.use(cors({ origin: '*' }))
app.use(koaBody());

createLogger(app);
createPostgraphile(app);
createUploader(app);

if (isProduction) {
  createVueSSR(app);
} else {
  createVueHMR(app);
}

module.exports = app;