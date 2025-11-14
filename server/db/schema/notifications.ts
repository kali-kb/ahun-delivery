import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { users } from './auth';


export const notifications = pgTable('notifications', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    message: text('message').notNull(),
    isRead: boolean('is_read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});