# sst-postgraphile

Serverless-Stack Postgraphile example

- Clone the repo
`git clone git@github.com:tyrauber/sst-postgraphile.git`
- Install the dependencies
`pnpm install`
- Add a .env.local file with the following secrets:
```
DATABASE_URL="postgres://postgres:postgres@localhost:5432/db"
SCHEMA= 'app'
DEFAULT_ROLE = 'guest'
JWT_IDENTIFIER = 'app.jwt_token'
JWT_SECRET = 'SUPER_SECRET_PLEASE_CHANGE'
```
- Run locally 
`pnpm dev`
- Deploy to stage environment
`pnpm run deploy --stage dev`

After running locally or deploying it will print an AWS Gateway API url.

You can use `/graphiql` or `/graphql`.

You can also test postgraphile with the same configuration by running:
`pnpm postgraphile`
