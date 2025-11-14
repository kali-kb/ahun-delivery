import { pgTable, serial, text, timestamp, boolean, json, integer, index } from 'drizzle-orm/pg-core';
import { users } from './auth';
import { relations } from 'drizzle-orm';
import { menus } from './menus';
import { restaurantRatings as ratings} from './restaurant-ratings';


export const restaurants = pgTable('restaurants', {
  id: serial('id').primaryKey(),
  ownerId: text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  image: text('image'),
  name: text('name').notNull().unique(),
  description: text('description'),
  location: text('location').notNull(),
  latitude: text('latitude'), // Geographic latitude
  longitude: text('longitude'), // Geographic longitude
  openingHours: json('opening_hours'), // e.g., { "monday": { "open": "09:00", "close": "22:00" }, ... }
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
},
  (table) => ({
    ownerIdIdx: index('restaurants_owner_id_idx').on(table.ownerId),
    nameIdx: index('restaurants_name_idx').on(table.name)
  })
);

export const restaurantMenus = relations(restaurants, ({ many }) => ({
  menus: many(menus),
  ratings: many(ratings),
}));


export type Restaurant = typeof restaurants.$inferSelect;
