import { ApiHandler } from "sst/node/api";
import { Pool } from 'pg';
import { graphql, GraphQLSchema, buildSchema } from 'graphql';


// import Cache from `${__dirname}/postgraphile.cache`;

import { options } from '.postgraphilerc.js';

import { withPostGraphileContext, createPostGraphileSchema } from 'postgraphile'
import exportPostGraphileSchema from 'postgraphile/build/postgraphile/schema/exportPostGraphileSchema'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})


type Maybe<T> = T | null | undefined;

export async function performQuery(
    schema: GraphQLSchema,
    query: string,
    variables: Maybe<{ [key: string]: any; }>,
    jwtToken: string,
    operationName?: string
) {
  return await withPostGraphileContext(
    {
      pgPool: pool,
      jwtToken: jwtToken,
      jwtSecret: process.env.JWT_SECRET,
      pgDefaultRole: process.env.DEFAULT_ROLE
    },
    async context => {
      // Execute your GraphQL query in this function with the provided
      // `context` object, which should NOT be used outside of this
      // function.
      return await graphql(
        schema, // The schema from `createPostGraphileSchema`
        query,
        null,
        { ...context }, // You can add more to context if you like
        variables,
        operationName
      );
    }
  );
}
export const schema = async () => {
    const graphQLSchema = await createPostGraphileSchema(pool, options.schema, options);
    await exportPostGraphileSchema(graphQLSchema, {
        ...options,
        exportGqlSchemaPath: __dirname + '/schema.graphql',
        writeCache: `${__dirname}/postgraphile.cache`,
    });
    process.exit(0)
}
