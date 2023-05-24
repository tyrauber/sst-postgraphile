import { StackContext, Api } from "sst/constructs";

export function API({ stack }: StackContext) {
  const api = new Api(stack, "api", {
    routes: {
      "GET /": "packages/functions/src/lambda.handler",
      "POST /schema": {
          function: {
              handler: "packages/functions/src/generateSchema.handler",
              environment: {
                  DATABASE_URL: process.env.DATABASE_URL,
                  DEFAULT_ROLE: process.env.DEFAULT_ROLE,
                  JWT_IDENTIFIER: process.env.JWT_IDENTIFIER,
                  JWT_SECRET: process.env.JWT_SECRET
              },
          }
      },
      "ANY /{proxy+}": {
        function: {
            handler: "packages/functions/src/postgraphile.handler",
            environment: {
              DATABASE_URL: process.env.DATABASE_URL,
              DEFAULT_ROLE: process.env.DEFAULT_ROLE,
              JWT_IDENTIFIER: process.env.JWT_IDENTIFIER,
              JWT_SECRET: process.env.JWT_SECRET
            },
            nodejs:{
              loader: {
                ".graphql": "text",
                ".cache": "text"
              }
            },
            copyFiles: [
              {"from": "./packages/functions/src/postgraphile.cache", "to": "packages/functions/src/postgraphile.cache"},
              {"from": "./.postgraphilerc.js", "to": "packages/functions/src/.postgraphilerc.js"},
            ]
        }
    },
    },
  });
  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
