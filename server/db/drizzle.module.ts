import { Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { DRIZZLE_ORM } from '../constants';
import { schema } from './schema';

@Module({
  providers: [{
    provide: DRIZZLE_ORM,
    useFactory: () => {
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not set in .env file');
      }
      // Use a connection pool
      const client = postgres(process.env.DATABASE_URL, { prepare: false });
      return drizzle(client, { schema });
    },
  }],
  exports: [DRIZZLE_ORM],
})
export class DrizzleModule {}