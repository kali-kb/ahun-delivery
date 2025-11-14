import { Inject, Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { schema } from '../../db/schema/index';
import { DRIZZLE_ORM } from '../../constants';
import { eq, and } from 'drizzle-orm';


@Injectable()
export class NotificationsService {
  constructor(
    @Inject(DRIZZLE_ORM) private db: PostgresJsDatabase<typeof schema>,
  ) {}

  create(userId: string, createNotificationDto: CreateNotificationDto) {
    return this.db.insert(schema.notifications).values({ ...createNotificationDto, userId }).returning();
  }

  findAllForUser(userId: string) {
    return this.db.query.notifications.findMany({
      where: eq(schema.notifications.userId, userId),
      orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
    });
  }

  findOne(id: number, userId: string) {
    return this.db.query.notifications.findFirst({
      where: and(eq(schema.notifications.id, id), eq(schema.notifications.userId, userId)),
    });
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return this.db.update(schema.notifications).set(updateNotificationDto).where(eq(schema.notifications.id, id)).returning();
  }

  remove(id: number) {
    return this.db.delete(schema.notifications).where(eq(schema.notifications.id, id)).returning();
  }
}
