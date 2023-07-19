import { readEnv } from './src';
import type { Config } from "drizzle-kit";

readEnv();

export default {
  driver: 'pg',
  schema: "./src/schema.ts",
  out: "./src/generated",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  }
} satisfies Config;