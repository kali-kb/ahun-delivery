import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';


export const promo = pgTable('promo', {
    id: serial('id').primaryKey(),
    headline: text('headline').notNull(),
    subheading: text('subheading').notNull(),
    cta: text('cta'),
    deadline: timestamp('deadline').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})