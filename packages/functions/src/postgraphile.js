import serverlessExpress from '@vendia/serverless-express';
import express from 'express';
import postgraphile from 'postgraphile';
import cors from 'cors';

const { options } = require(`${__dirname}./.postgraphilerc`);
const app = express();

app.use(cors())

app.use(
  postgraphile(
    options.connection,
    options.schema,
    { ...options,
      readCache: `${__dirname}postgraphile.cache`,
    }
  )
);

export const handler = serverlessExpress({ app });