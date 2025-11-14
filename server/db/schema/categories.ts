import { pgTable, serial, text, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { menus } from './menus';

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  image: text('image'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
},
  (table) => ({
    nameIdx: index('categories_name_idx').on(table.name),
  })
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  menus: many(menus),
}));

export type Category = typeof categories.$inferSelect;
