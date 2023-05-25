import {ApiHandler} from "sst/node/api";
import {Pool} from "pg";
import {createPostGraphileSchema, withPostGraphileContext} from "postgraphile";
import {graphql, GraphQLSchema, printSchema} from "graphql";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('error', error => {
    console.error('Postgres generated pool error!', error)
})

const { options } = require(`${__dirname}./.postgraphilerc`);

const getPostGraphileSchemaPromise = (): Promise<GraphQLSchema> => {
    console.log("Getting new promise for schema");
    return createPostGraphileSchema(pool, options.schema);
};

const postgraphileSchemaPromise =  await getPostGraphileSchemaPromise();

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

export const handler = ApiHandler(async (_evt) => {
    if(!_evt.body){
        return {
            statusCode: 400,
        }
    }
    const reqBody = JSON.parse(_evt.body!)

    const authorizationHeader = _evt.headers["authorization"] || _evt.headers["Authorization"];
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        return {
            statusCode: 401,
        }
    }

    let postgraphileSchema: GraphQLSchema;

    console.log('Awaiting schema')
    const startSchemaPromise = new Date().getTime();
    try {
        postgraphileSchema = postgraphileSchemaPromise;
    } catch (error) {
        console.error('Rebuilding schema after connection loss');
        postgraphileSchema = await getPostGraphileSchemaPromise();
    }
    const endSchemaPromise = new Date().getTime();
    console.log(`load schema time: ${ endSchemaPromise - startSchemaPromise}ms`);

    const jwtToken = authorizationHeader.substring(7, authorizationHeader.length);
    console.log('Query:', reqBody.query)
    console.log('Variables:', reqBody.variables)

    const performQueryStart = new Date().getTime();

    const result = await performQuery(postgraphileSchema, reqBody.query, reqBody.variables, jwtToken);
    const performQueryEnd = new Date().getTime();

    console.log(`Perform query execution time: ${ performQueryEnd - performQueryStart}ms`);

    console.log('Result:', result)

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(result, null, 2),
    }
});
