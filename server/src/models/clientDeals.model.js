import { pgTable, varchar, date, timestamp, jsonb, text } from 'drizzle-orm/pg-core';
import { Client } from './client.model.js'; // Import the clients table model

// ClientDeals table definition
export const clientDeals = pgTable('client_deals', {
    deal_id: varchar('deal_id', { length: 255 }).primaryKey(),
    clientid: varchar('clientid', { length: 255 }).notNull().references(() => Client.clientid),
    // Define the paymentMethod column with CHECK constraint
    payment_method: varchar('payment_method', { length: 10 }).notNull(),
    issue_date: date('issue_date'),
    valid_through: date('valid_through'),
    representative: varchar('representative', { length: 100 }),
    designation: varchar('designation', { length: 100 }),
    contact_no: varchar('contact_no', { length: 15 }),
    bankInfo: jsonb('bank_info'),
    notes: text('notes'),
    status: varchar('status', { length: 30 }).default('Pending'),
    remarks: text('remarks'),
    is_active: boolean('is_active').default(true),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
});
