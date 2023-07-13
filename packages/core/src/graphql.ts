import * as fs from "fs";
import memoizee from 'memoizee';
import Postgraphile,  { createPostGraphileSchema, withPostGraphileContext } from 'postgraphile';
import { buildClientSchema,  IntrospectionQuery, graphql, GraphQLSchema } from "graphql";
const { options } = require(`${__dirname}./.postgraphilerc`);
import { pool } from "./database";

/* Read or write schema to tmp and memoize the result */
let schema;
export const getGraphqlSchema = async (): Promise<GraphQLSchema> => {
  if(schema) return schema;
  const cachePath = `/tmp/postgraphile.cache`;
  options[fs.existsSync(cachePath) ? 'readCache': 'writeCache']= cachePath;
  return createPostGraphileSchema(pool, options.schema, {
    ...options
  });
}
schema = await getGraphqlSchema();

export const middleware = Postgraphile(
  pool,
  options.schema,
  { ...options,
    readCache: `/tmp/postgraphile.cache`,
    graphiql: true,
    graphiqlRoute: '/graphiql',
  }
);

export async function performQuery(
    query: string,
    variables: Maybe<{ [key: string]: any; }>,
    jwtToken: string,
    operationName?: string
) {
  const startAt = new Date().getTime();
  console.log({ query, variables, jwtToken,      jwtSecret: process.env.JWT_SECRET,
    pgDefaultRole: process.env.DEFAULT_ROLE })
  return await withPostGraphileContext(
    {
      pgPool: pool,
      jwtToken: jwtToken,
      jwtSecret: process.env.JWT_SECRET,
      pgDefaultRole: process.env.DEFAULT_ROLE
    },

    async context => {
      console.log(schema)
      return await graphql(
        schema,
        query,
        null,
        { ...context },
        variables,
        operationName
      ).then((result) => {
        return Object.assign(result||{}, {elapsedTime: new Date().getTime() - startAt});
      });
    }
  );
}

export default { middleware, getGraphqlSchema }