process.env.DATABASE_URL ||= 'postgres://postgres:postgres@localhost:5432/sst_aurora_v2_test';

import Database from '../src';
import { execSync } from "child_process";
let db:any; 

beforeAll(async()=> {
  db = await Database();
  execSync(`createdb ${db.sql.options.database!}`);
  await db.migrate();
})
afterAll(async()=> {
  await db.sql.end();
  execSync(`dropdb ${db.sql.options.database!}`);
})

describe('packages/database', () => {
  describe('migrate', () => {
    test('it should migrate the db (app.users)', async () => {
      const results = await db.sql`SELECT * FROM information_schema.tables WHERE table_schema = 'app';`;
      expect(results[0].table_name).toBe('users');
      expect(results[0].table_schema).toBe('app');
    });
  });
});
  