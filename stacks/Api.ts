import { use, StackContext, Api, Config } from "sst/constructs";
import { Database } from "./Database.ts";

export function API({ stack }: StackContext) {
  const { policies } = use(Database);
  const api = new Api(stack, "api", {
    defaults: {
      function: {
        //bind: [rds],
        environment: {
          DEFAULT_ROLE: process.env.DEFAULT_ROLE,
          JWT_IDENTIFIER: process.env.JWT_IDENTIFIER,
          JWT_SECRET: process.env.JWT_SECRET
        },
        copyFiles: [
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
      "ANY /{proxy+}": {
        function: {
          handler: "packages/functions/src/graphql.main"
        }
      },
      "GET /schema": {
        function: {
            handler: "packages/functions/src/graphql.schema"
        }
      },
      "ANY /query": {
        function: {
          handler: "packages/functions/src/graphql.query",
        }
    },
      "GET /": {
        function: {
          handler: "packages/functions/src/status.main",
        }
    },
    },
  });
  api.attachPermissions(policies)
  stack.addOutputs({
    ApiEndpoint: api.url
  });
}
