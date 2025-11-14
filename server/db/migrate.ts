import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in .env file');
  }

  const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
  console.log('Running migrations...');
  await migrate(drizzle(migrationClient), { migrationsFolder: './db/migrations' });
  console.log('Migrations completed!');
  await migrationClient.end();
}

runMigrations().catch(console.error);