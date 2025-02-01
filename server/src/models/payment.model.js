import { pgTable, varchar, timestamp, real, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { invoices } from "./invoice.model.js"; // Linked to invoices

export const payments = pgTable("payments", {
    paymentid: varchar("paymentid", { length: 255 }).primaryKey(), // Primary Key
    invoiceid: varchar("invoiceid", { length: 255 })
        .notNull()
        .references(() => invoices.invoiceid, { onDelete: "cascade" }), // Foreign Key
    amount: real("amount").notNull(), // Payment amount
    payment_date: timestamp("payment_date").defaultNow(), // Payment date
    payment_method: varchar("payment_method", { length: 50 }).notNull(), // Payment method: Cash, Card, Bank Transfer
    notes: text("notes"), // Additional notes
    remarks: text("remarks"), // Remarks
    created_at: timestamp("created_at").defaultNow(), // Timestamp for record creation
    updated_at: timestamp("updated_at").defaultNow(), // Timestamp for updates
});

// Define relationships (if needed)
export const paymentRelations = relations(payments, ({ one }) => ({
    invoice: one(invoices, {
        fields: [payments.invoiceid],
        references: [invoices.invoiceid],
    }),
}));