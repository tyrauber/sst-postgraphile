import {ApiHandler} from "sst/node/api";
import serverless from 'serverless-http';
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { performQuery, middleware, getGraphqlSchema }from '@sst-postgraphile/core/graphql';

export const main = serverless(middleware);

export const schema = async (event: APIGatewayProxyEventV2) => {
  const results =  await getGraphqlSchema()
  return {
      statusCode: 200,
      body: JSON.stringify(results, null, 2),
  };
};

export const query = ApiHandler(async (e) => {
  const performQueryStart = new Date().getTime();
  const reqBody = JSON.parse(e?.body||{})
  const jwtToken = Object.entries(e.headers)
      .find(([key]) => key.toLowerCase() === 'authorization')
      ?.[1]?.toLowerCase()
      ?.replace(/^bearer\s+/i, '') || null;

  const result = await performQuery(reqBody.query, reqBody.variables, jwtToken);
  const performQueryEnd = new Date().getTime();
  result.elapsedTime = performQueryEnd - performQueryStart;

  return {
      statusCode: 200,
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(result, null, 2),
  }
});
