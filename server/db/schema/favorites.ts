import { integer, pgTable, serial, timestamp, text, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { menus } from './menus';
import { users } from './auth';
import { relations } from 'drizzle-orm';


export const favorites = pgTable('favorites', {
    id: serial('id').primaryKey(),
    menuItemId: integer('menu_item_id').notNull().references(() => menus.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
},
    (table) => ({
        menuIdIdx: index('favorites_menu_item_id_idx').on(table.menuItemId),
        userIdIdx: index('favorites_user_id_idx').on(table.userId),
        userMenuUniqueIdx: uniqueIndex('favorites_user_menu_unique_idx').on(table.userId, table.menuItemId)
    })
);

export const favoritesRelations = relations(favorites, ({ one }) => ({
    menuItem: one(menus, {
        fields: [favorites.menuItemId],
        references: [menus.id],
    }),
}));

