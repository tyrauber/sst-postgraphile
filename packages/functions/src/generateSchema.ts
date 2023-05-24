import {ApiHandler} from "sst/node/api";
import {schema} from "./graphql";


export const handler = ApiHandler(async (_evt) => {

    const schemaResponse = await schema();
    return {
        statusCode: 200,
        // headers: {
        //     'Content-Type': 'application/json',
        // },
        // body: JSON.stringify("result", null, 2),
    }
});
