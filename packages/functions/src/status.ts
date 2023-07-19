import { APIGatewayProxyEventV2 } from "aws-lambda";
import Database from "@sst-postgraphile/database/src/index";

export const main = async (event: APIGatewayProxyEventV2) => {
  try{
    const { sql } = await Database();
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