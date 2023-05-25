import serverless from 'serverless-http';
import postgraphile from 'postgraphile';
const { options } = require(`${__dirname}./.postgraphilerc`);

const middleware = postgraphile(
  options.connection,
  options.schema,
  { ...options,
    readCache: `${__dirname}postgraphile.cache`,
    graphiql: true,
    graphiqlRoute: '/graphiql',
  }
);

export const handler = serverless(middleware);