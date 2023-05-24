import {ApiHandler} from "sst/node/api";
import {performQuery} from "./graphql";
import {createPostGraphileSchema} from "postgraphile";

export const handler = ApiHandler(async (_evt) => {
    const reqBody = JSON.parse(_evt.body!)

    const authorizationHeader = _evt.headers["authorization"] || _evt.headers["Authorization"];
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        return {
            statusCode: 401,
        }
    }

    const jwtToken = authorizationHeader.substring(7, authorizationHeader.length);

    console.log('Query:', reqBody.query)
    console.log('Variables:', reqBody.variables)

    const result = await performQuery(null, reqBody.query, reqBody.variables, jwtToken, reqBody.operationName);
    console.log('Result:', result)

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(result, null, 2),
    }
});
