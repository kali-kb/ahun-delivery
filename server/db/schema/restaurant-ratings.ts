import { pgTable, serial, text, timestamp, integer, varchar} from 'drizzle-orm/pg-core';
import { users } from './auth';
import { restaurants } from './restaurants';

export const restaurantRatings = pgTable('restaurant_ratings', {
  id: serial('id').primaryKey(),
  reviewerId: text('reviewer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  restaurantId: integer('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  feedback: varchar('feedback', {length: 350}),
  starRating: integer('star_rating').notNull(), 
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
