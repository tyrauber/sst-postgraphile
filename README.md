# sst-postgraphile

Serverless-Stack Postgraphile Example

- [Postgraphile](https://www.graphile.org/postgraphile) is a GraphQL API server for existing PostgreSQL databases
- [Serverless-Stack (SST)](https://sst.dev/) is a framework for building serverless application architectures on AWS

The purpose of this example is to expirement with, and optimize, Postgraphile in an AWS Serverless Environment.

## Usage
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

## Architecture

There are three different implementations of Postgraphile in this repo. All use the [same Postgraphile configuration](https://github.com/tyrauber/sst-postgraphile/blob/main/.postgraphilerc.js).

- [Local CLI](https://www.graphile.org/postgraphile/usage-cli/)
```pnpm postgraphile```
- [Library](https://www.graphile.org/postgraphile/usage-library/)
```pnpm run deploy --stage dev```
- [Schema-Only](https://www.graphile.org/postgraphile/usage-schema/)
```pnpm run deploy --stage dev```

The Schema-Only implementation, ([packages/functions/src/postgraphile_lambda.ts](https://github.com/tyrauber/sst-postgraphile/blob/main/packages/functions/src/postgraphile_lambda.ts)) is designed for performance, and is accessible at the root api endpoint `/`.

The Library Implmentation, ([packages/functions/src/postgraphile_library.js](https://github.com/tyrauber/sst-postgraphile/blob/main/packages/functions/src/postgraphile_library.js)), is meant to privide full library functionality including GraphiQL. The graphql endpoint is available at`/graphql` and the GraphiQL endpoint at `/graphiql`.

This example uses a [modified verison](https://github.com/tyrauber/sst-postgraphile/blob/main/schema.sql) of the [postgraphile forum example](https://github.com/graphile/postgraphile/blob/main/examples/forum/TUTORIAL.md).

### Quick links:
- [schema.sql](https://github.com/tyrauber/sst-postgraphile/blob/main/schema.sql) postgres schema
- [.postgraphilerc.js](https://github.com/tyrauber/sst-postgraphile/blob/main/.postgraphilerc.js) postgraphile config
- [/stacks/MyStack.ts](https://github.com/tyrauber/sst-postgraphile/blob/main/stacks/MyStack.ts) SST Stack config
- [/packages/functions/src/makeCache.js](https://github.com/tyrauber/sst-postgraphile/blob/main/packages/functions/src/makeCache.js) generates the cache
- [packages/functions/src/postgraphile_library.js](https://github.com/tyrauber/sst-postgraphile/blob/main/packages/functions/src/postgraphile_library.js)  Postgraphile Library Lambda
- [packages/functions/src/postgraphile_lambda.ts](https://github.com/tyrauber/sst-postgraphile/blob/main/packages/functions/src/postgraphile_lambda.ts)  Postgraphile Schema-Only Lambda

## Testing

A test package is provided that runs through some graphql queries - Signup, SignIn and WhoAmI:

```
pnpm test https://URL
```

 - Signup
```
curl -X POST \
-H "Content-Type: application/json" \
-d '{
  "query": "mutation userSignup($input: SignupInput!) { signup(input: $input) { jwtToken } }",
  "variables": {
    "input": {
      "email": "email@example.com",
      "password": "password"
    }
  }
}' \
https://URL/graphql\
-o /dev/null -s -w "Total: %{time_total}s\n"
```

 - Signin
```
curl -X POST   -H "Content-Type: application/json"   -d '{
  "query": "mutation userSignin($input: SigninInput!) { signin(input: $input) { jwtToken } }",
  "variables": {
    "input": {
      "email": "email@example.com",
      "password": "password"
    }
  }
}' \
https://URL/graphql \
-o /dev/null -s -w "Total: %{time_total}s\n"
```

 - Me
```
curl -X POST \
-H "Content-Type: application/json" \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoibWVtYmVyIiwidXNlcl9pZCI6ImY2MWMxYjg0LTIxODctMTFlZS1iMzRmLTdiMWM2MjhhZDE0OSIsImlhdCI6MTY4OTI2MTQ1OSwiZXhwIjoxNjg5MzQ3ODU5LCJhdWQiOiJwb3N0Z3JhcGhpbGUiLCJpc3MiOiJwb3N0Z3JhcGhpbGUifQ.HppqWBBrDgRGWsaMwk-P1oH1kjA91FxbaNqtSe6nOBA'\
 -d '{
  "query": "query whoAmI {me {id email role}}"
}' \
https://URL/graphql \
-o /dev/null -s -w "Total: %{time_total}s\n"
```
