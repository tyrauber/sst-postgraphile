import awsServerlessExpress from 'aws-serverless-express';
import { postgraphile } from 'postgraphile';

const cors = require('cors');

const options = {
    dynamicJson: true,
    cors: true,
    graphiql: false,
    graphqlRoute: '/graphql',
    externalUrlBase: `/graphql`,
  
    // If consuming JWT:
    jwtSecret: process.env.JWT_SECRET || String(Math.random()),
    // If generating JWT:
    jwtPgTypeIdentifier: process.env.JWT_IDENTIFIER,
  
    /* If you want to enable GraphiQL, you must use `externalUrlBase` so PostGraphile
     * knows where to tell the browser to find the assets.  Doing this is
     * strongly discouraged, you should use an external GraphQL client instead.
  
      graphiql: true,
      enhanceGraphiql: true,
      graphqlRoute: '/',
      graphiqlRoute: '/graphiql',
    */
  };

function combineMiddlewares(middlewares) {
    return middlewares.reduce(
      (parent, fn) => {
        return (req, res, next) => {
          parent(req, res, error => {
            if (error) {
              return next(error);
            }
            fn(req, res, next);
          });
        };
      },
      (_req, _res, next) => next()
    );
  };

const schemas = process.env.DATABASE_SCHEMAS
  ? process.env.DATABASE_SCHEMAS.split(',')
  : ['app'];

console.log('postgraphile', process.env.DATABASE_URL, schemas, options)
const app = combineMiddlewares([
  cors(),

  // Determines the effective URL we are at if `absoluteRoutes` is set
  (req, res, next) => {
    if (options.absoluteRoutes) {
      try {
        const event = JSON.parse(decodeURIComponent(req.headers['x-apigateway-event']));
        // This contains the `stage`, making it a true absolute URL (which we
        // need for serving assets)
        const realPath = event.requestContext.path;
        req.originalUrl = realPath;
      } catch (e) {
        return next(new Error('Processing event failed'));
      }
    }
    next();
  },
  postgraphile(process.env.DATABASE_URL, schemas, {
    ...options,
    //readCache: `${__dirname}/postgraphile.cache`,
  }),
]);

const Handler = (req, res) => {
  app(req, res, err => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      if (!res.headersSent) {
        res.statusCode = err.status || err.statusCode || 500;
        res.setHeader('Content-Type', 'application/json');
      }
      res.end(JSON.stringify({ errors: [{message: err.message}] }));
      return;
    }
    if (!res.finished) {
      if (!res.headersSent) {
        res.statusCode = 404;
      }
      res.end(`'${req.url}' not found`);
    }
  });
};

const binaryMimeTypes = options.graphiql ? ['image/x-icon'] : undefined;
const server = awsServerlessExpress.createServer(Handler, undefined, binaryMimeTypes);
export const handler = (event, context) => awsServerlessExpress.proxy(server, event, context);