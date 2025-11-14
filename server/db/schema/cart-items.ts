import { pgTable, serial, integer, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './auth';
import { menus } from './menus';

export const cartItems = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  menuItemId: integer('menu_item_id').notNull().references(() => menus.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(1),
});

export type CartItem = typeof cartItems.$inferSelect;

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  menuItem: one(menus, {
    fields: [cartItems.menuItemId],
    references: [menus.id],
  }),
}));