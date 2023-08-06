import path from 'path';
import { drizzle as Drizzle } from 'drizzle-orm/postgres-js';
import { migrate as Migrate } from 'drizzle-orm/postgres-js/migrator';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import postgres from 'postgres'

export const main = async () => {
  let DATABASE_URL = process.env.DATABASE_URL;

  if(process.env.RDS_SECRET_ARN){
    const secretsClient = new SecretsManagerClient({})
    const secret = await secretsClient.send(new GetSecretValueCommand({
      SecretId: process.env.RDS_SECRET_ARN,
    }))
    const secretValues = JSON.parse(secret.SecretString ?? '{}')
    DATABASE_URL = `postgres://${secretValues.username}:${secretValues.password}@${secretValues.host}:${secretValues.port}/postgres`;
  }

  const sql = postgres(DATABASE_URL!, { 
    idle_timeout: process.env.NODE_ENV==='test' ? 1 : undefined,
    max: 1
  })

  const drizzle = Drizzle(sql);

  const migrate = async () => {
    await Migrate(drizzle, { migrationsFolder: path.resolve(__dirname, './generated') });
    console.log('Database Migrated');
  }

  return { DATABASE_URL, postgres, sql, drizzle, migrate }
}

export const migrate = async () => {
  const { migrate} = await main();
  await migrate();
}

export default main;

// if (process.argv.includes('migrate')) {
//   (async ()=> {
//     await migrate();
//     process.exit(0);
//   })();
// }
