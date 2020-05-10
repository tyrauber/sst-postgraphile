
//******************************
// Postgraphile Configuration
//******************************

const mount = require('koa-mount');
const { postgraphile } = require('postgraphile');
const { makeAddInflectorsPlugin } = require('graphile-utils');
const { formatInsideUnderscores } = require('graphile-build');
const snakeCaseAll = require("lodash/snakeCase");

const PgSimplifyInflectorPlugin = require("@graphile-contrib/pg-simplify-inflector");
const ConnectionFilterPlugin = require("postgraphile-plugin-connection-filter");
const PostGISPlugin = require("@graphile/postgis");
const PgSnakeCasePlugin = makeAddInflectorsPlugin({
  camelCase: formatInsideUnderscores(snakeCaseAll),
}, true);

const knex = require('../db')
const db = knex.client.config
const connection = knex.client.connectionSettings
let path = '/'

const createPostgraphile = (app) =>{
  let config = {
    appendPlugins: [PgSnakeCasePlugin,PgSimplifyInflectorPlugin, ConnectionFilterPlugin,  PostGISPlugin.default || PostGISPlugin],    
    watchPg: db.watchPg,
    graphiql: true,
    enhanceGraphiql: true,
    retryOnInitFail: true,
    jwtPgTypeIdentifier: db.jwt_identifier,
    jwtSecret: db.app_secret,
    pgDefaultRole: db.default_role,
    dynamicJson: true
  }
  if(process.env._HANDLER){
    config.externalUrlBase = `/${process.env.stage}`
  } else {
    path = `/${process.env.stage}`
  }
  console.log(path)
  app.use(mount(path, postgraphile(connection, db.schema, config)));
}

module.exports.createPostgraphile = createPostgraphile;