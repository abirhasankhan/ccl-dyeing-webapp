import { pgTable, varchar, date, timestamp, jsonb, text } from 'drizzle-orm/pg-core';
import { Client } from './client.model.js'; // Import the clients table model

// ClientDeals table definition
export const clientDeals = pgTable('client_deals', {
    deal_id: varchar('deal_id', { length: 20 }).primaryKey(),
    clientid: varchar('clientid', { length: 20 }).notNull().references(() => Client.clientid),
    // Define the paymentMethod column with CHECK constraint
    paymentMethod: varchar('payment_method', { length: 10 }).notNull(),
    issueDate: date('issue_date'),
    validThrough: date('valid_through'),
    representative: varchar('representative', { length: 100 }),
    designation: varchar('designation', { length: 100 }),
    contactNo: varchar('contact_no', { length: 15 }),
    bankInfo: jsonb('bank_info'),
    notes: text('notes'),
    remarks: text('remarks'),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
});
