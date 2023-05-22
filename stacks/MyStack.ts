import { StackContext, Api } from "sst/constructs";

export function API({ stack }: StackContext) {
  const api = new Api(stack, "api", {
    routes: {
      "GET /": "packages/functions/src/lambda.handler",
      "GET /{proxy+}": {
        function: {
            handler: "packages/functions/src/graphql.handler",
            environment: {
              DATABASE_URL: process.env.DATABASE_URL,
              DEFAULT_ROLE: process.env.DEFAULT_ROLE,
              JWT_IDENTIFIER: process.env.JWT_IDENTIFIER,
              JWT_SECRET: process.env.JWT_SECRET
            },
            nodejs:{
              loader: {
                ".graphql": "text"
              }
            }
        }
    },
    },
  });
  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
