import {ApiHandler} from "sst/node/api";
import {performQuery} from "./graphql";
import {Pool} from "pg";
import {createPostGraphileSchema} from "postgraphile";
import {GraphQLSchema, printSchema} from "graphql";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('error', error => {
    console.error('Postgres generated pool error!', error)
})

const options = {
    port: 3000,
    connection: process.env.DATABASE_URL,
    schema: ['public', 'app'],
    jwtSecret: process.env.JWT_SECRET,
    defaultRole: process.env.DEFAULT_ROLE,
    jwtPgTypeIdentifier: process.env.JWT_IDENTIFIER,
    jwtTokenIdentifier: process.env.JWT_IDENTIFIER,
    graphiql: true,
    //watch: true,
    enhanceGraphiql: true,
    //retryOnInitFail: true,
    dynamicJson: true,
    cors: true
}

const getPostGraphileSchemaPromise = (): Promise<GraphQLSchema> => {
    console.log("Getting new promise for schema");
    return createPostGraphileSchema(pool, options.schema);
};

const postgraphileSchemaPromise =  await getPostGraphileSchemaPromise();

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
