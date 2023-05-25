// This script is called from scripts/generate-cache
const { createPostGraphileSchema } = require('postgraphile');
const { options } = require(`${__dirname}/../../../.postgraphilerc`);
const { Pool } = require('pg');

async function main() {
  const pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  await createPostGraphileSchema(pgPool, options.schema, {
    ...options,
    writeCache: `${__dirname}/postgraphile.cache`,
  });
  await pgPool.end();
}

main().then(null, e => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});