import { Pool } from 'pg';
import postgres from 'postgres'
import fs from 'fs/promises'
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'

export const getDatabaseUrl = async () => {
  const secretsClient = new SecretsManagerClient({})
  const secret = await secretsClient.send(new GetSecretValueCommand({
    SecretId: process.env.RDS_SECRET_ARN,
  }))
  const secretValues = JSON.parse(secret.SecretString ?? '{}')
  const DATABASE_URL = `postgres://${secretValues.username}:${secretValues.password}@${secretValues.host}:${secretValues.port}/postgres`;
  process.env.DATABASE_URL = DATABASE_URL;
  return DATABASE_URL;
}

await getDatabaseUrl();

export const sql = postgres(process.env.DATABASE_URL);
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// export const migrations = async (options={}) => {
//   const { sql } = await main(options)
//   return await sql`CREATE TABLE IF NOT EXISTS migrations (
//     id serial PRIMARY KEY,
//     name varchar(255) NOT NULL,
//     created_at timestamp NOT NULL DEFAULT NOW()
//   );`
// }
// export const migrate = async (options={}) => {
//   await migrations(options)
//   const files = await fs.readdir(path.resolve('migrations'))
// }

export default { sql, pool }