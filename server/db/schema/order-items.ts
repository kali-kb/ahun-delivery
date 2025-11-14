import { pgTable, serial, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { orders } from './orders';
import { menus } from './menus';
 
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  menuItemId: integer('menu_item_id').notNull().references(() => menus.id, { onDelete: 'restrict' }),
  quantity: integer('quantity').notNull().default(1),
  priceAtOrder: integer('price_at_order').notNull(), // Price of a single item at the time of order
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  menuItem: one(menus, {
    fields: [orderItems.menuItemId],
    references: [menus.id],
  }),
}));
 
export type OrderItem = typeof orderItems.$inferSelect;