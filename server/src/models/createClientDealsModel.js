import { pgTable, varchar, date, timestamp, jsonb, text, pgEnum } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Enum for payment methods
export const paymentMethodEnum = pgEnum('payment_method', ['Cash', 'Bank', 'Hybrid']);

// ClientDeals table definition
export const clientDeals = pgTable('ClientDeals', {
    dealId: varchar('deal_id', { length: 20 }).primaryKey(),
    clientId: varchar('clientid', { length: 20 }).notNull().references(() => clients.clientId),
    paymentMethod: paymentMethodEnum.notNull(),
    issueDate: date('issue_date'),
    validThrough: date('valid_through'),
    representative: varchar('representative', { length: 100 }),
    designation: varchar('designation', { length: 100 }),
    contactNo: varchar('contact_no', { length: 15 }),
    bankInfo: jsonb('bank_info'),
    notes: text('notes'),
    remarks: text('remarks'),
    created_at: timestamp("created_at").defaultNow(), // Automatically set creation timestamp
    updated_at: timestamp("updated_at").defaultNow(), // Automatically set update timestamp
});