import { pgTable, serial, text, timestamp, integer, varchar} from 'drizzle-orm/pg-core';
import { users } from './auth';
import { menus } from './menus';

export const menuRatings = pgTable('menu_ratings', {
  id: serial('id').primaryKey(),
  reviewerId: text('reviewer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  menuitemId: integer('menu_item_id').notNull().references(() => menus.id, { onDelete: 'cascade' }),
  starRating: integer('star_rating').notNull(),
  feedback: varchar('feedback', {length: 350}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
