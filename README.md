# sst-postgraphile

Serverless-Stack Postgraphile example

- Clone the repo
`git clone git@github.com:tyrauber/sst-postgraphile.git`
- Install the dependencies
`pnpm install`
- Add a .env.local file with the following secrets:
```
DATABASE_URL="postgres://postgres:postgres@localhost:5432/db" (Change for RDS_URL)
SCHEMA= 'app'
DEFAULT_ROLE = 'guest'
JWT_IDENTIFIER = 'app.jwt_token'
JWT_SECRET = 'SUPER_SECRET_PLEASE_CHANGE'
```
- Build the graphql schema
`pnpm prebuild`
- Run locally 
`pnpm dev`
- Deploy to stage environment
`pnpm run deploy --stage dev`

After running locally or deploying it will print an AWS Gateway API url.

You can use `/graphiql` or `/graphql`.

You can also test postgraphile with the same configuration by running:
`pnpm postgraphile`

This example uses a [modified verison](https://github.com/tyrauber/sst-postgraphile/blob/main/schema.sql) of the [postgraphile forum example](https://github.com/graphile/postgraphile/blob/main/examples/forum/TUTORIAL.md).

### Quick links:
- [schema.sql](https://github.com/tyrauber/sst-postgraphile/blob/main/schema.sql) postgres schema
- [.postgraphilerc.js](https://github.com/tyrauber/sst-postgraphile/blob/main/.postgraphilerc.js) postgraphile config
- [/stacks/MyStack.ts](https://github.com/tyrauber/sst-postgraphile/blob/main/stacks/MyStack.ts) SST Stack config
- [/packages/functions/src/makeCache.js](https://github.com/tyrauber/sst-postgraphile/blob/main/packages/functions/src/makeCache.js) generates the cache
- [/packages/functions/src/postgraphile.js](https://github.com/tyrauber/sst-postgraphile/blob/main/packages/functions/src/postgraphile.js)  Express Postgraphile Library Lambda