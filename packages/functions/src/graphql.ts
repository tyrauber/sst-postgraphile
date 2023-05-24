import { Pool } from 'pg';
import { graphql, GraphQLSchema } from 'graphql';

import { withPostGraphileContext, createPostGraphileSchema } from 'postgraphile'
import exportPostGraphileSchema from 'postgraphile/build/postgraphile/schema/exportPostGraphileSchema'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})
const options = {
    connection: process.env.DATABASE_URL,
    schema: [process.env.SCHEMA || "public"],
    jwtSecret: process.env.DEFAULT_ROLE  || "SUPER_SECRET_JWT_SECRET",
    defaultRole:  process.env.DEFAULT_ROLE  || "guest",
    jwtTokenIdentifier: process.env.JWT_IDENTIFIER || "app.jwt_token",
    watch: false,
}

type Maybe<T> = T | null | undefined;

export async function performQuery(
    schema: GraphQLSchema,
    query: string,
    variables: Maybe<{ [key: string]: any; }>,
    jwtToken: string,
    operationName: string
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
    console.log(`PostGraphile schema exported to ${__dirname}/schema.graphql`);
    return
}
