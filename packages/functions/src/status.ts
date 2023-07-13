import { APIGatewayProxyEventV2 } from "aws-lambda";
import { sql } from "@sst-postgraphile/core/database";

export const main = async (event: APIGatewayProxyEventV2) => {
  try{
    const query = await sql`SELECT version() as Postgres;`;
    return {
      statusCode: 200,
      body: JSON.stringify(query?.[0]),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({error: error.message }),
    };
  };
};

export default main