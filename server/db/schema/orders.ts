import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './auth';
import { restaurants } from './restaurants';
import { orderStatusEnum } from './enums/order-status';
import { orderItems } from './order-items';

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  restaurantId: integer('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'restrict' }),
  deliveryPersonId: text('delivery_person_id').references(() => users.id, { onDelete: 'set null' }),

  deliveryAddress: text('delivery_address').notNull(),
  totalPrice: integer('total_price').notNull(), // Store price in cents to avoid floating point issues
  status: orderStatusEnum('status').default('pending').notNull(),
  notes: text('notes'), // Customer notes for the order

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  restaurant: one(restaurants, {
    fields: [orders.restaurantId],
    references: [restaurants.id],
  }),
  deliveryPerson: one(users, {
    fields: [orders.deliveryPersonId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
}));

export type Order = typeof orders.$inferSelect;
