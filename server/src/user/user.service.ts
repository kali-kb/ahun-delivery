import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { DRIZZLE_ORM } from '../../constants';
import * as schema from '../../db/schema';

type NewUser = typeof schema.users.$inferInsert;

@Injectable()
export class UserService {
  constructor(
    @Inject(DRIZZLE_ORM) private db: PostgresJsDatabase<typeof schema>,
  ) {}

  async updateUserLocation(
    userId: string,
    latitude: string,
    longitude: string,
    address: string,
  ) {
    const result = await this.db
      .update(schema.users)
      .set({
        latitude,
        longitude,
        address,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId))
      .returning();

    return result[0];
  }

  async getUserLocation(userId: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
      columns: {
        id: true,
        latitude: true,
        longitude: true,
        address: true,
      },
    });

    return user;
  }
}
