import { boolean, integer, pgTable, serial, text, timestamp, json, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { categories } from './categories';
import { menuRatings as ratings} from './menu-ratings';
import { restaurants } from './restaurants';
import { favorites } from './favorites';


export const menus = pgTable('menus', {
    id: serial('id').primaryKey(),
    restaurantId: integer('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
    item_img: text('item_img'),
    name: text('name').notNull(),
    categoryId: integer('category_id').notNull().references(() => categories.id),
    description: text('description'),
    price: integer('price').notNull(),
    metadata: json('metadata'),
    isAvailable: boolean('is_available').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
},
    (table) => ({
        restaurantIdIdx: index('menus_restaurant_id_idx').on(table.restaurantId),
        categoryIdIdx: index('menus_category_id_idx').on(table.categoryId),
        nameIdx: index('menus_name_idx').on(table.name)
    })
);

export const menusRelations = relations(menus, ({ one, many }) => ({
  category: one(categories, { fields: [menus.categoryId], references: [categories.id] }),
  restaurant: one(restaurants, { fields: [menus.restaurantId], references: [restaurants.id] }),
  ratings: many(ratings),
  favorites: many(favorites),
}));
export type MenuItem = typeof menus.$inferSelect;