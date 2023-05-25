import { StackContext, Api } from "sst/constructs";

export function API({ stack }: StackContext) {
  const api = new Api(stack, "api", {
    defaults: {
      function: {
        environment: {
          DATABASE_URL: process.env.DATABASE_URL,
          DEFAULT_ROLE: process.env.DEFAULT_ROLE,
          JWT_IDENTIFIER: process.env.JWT_IDENTIFIER,
          JWT_SECRET: process.env.JWT_SECRET
        },
        copyFiles: [
          {"from": "./packages/functions/src/postgraphile.cache", "to": "packages/functions/src/postgraphile.cache"},
          {"from": "./.postgraphilerc.js", "to": "packages/functions/src/.postgraphilerc.js"},
        ],
        nodejs:{
          loader: {
            ".graphql": "text",
            ".cache": "text"
          }
        },
      }
    },
    routes: {
      "ANY /": {
          function: {
            handler: "packages/functions/src/postgraphile_lambda.handler",
          }
      },
      "ANY /{proxy+}": {
        function: {
          handler: "packages/functions/src/postgraphile_library.handler"
        }
      },
    },
  });
  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
