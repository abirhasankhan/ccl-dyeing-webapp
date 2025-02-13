import { pgTable, varchar, date, integer, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { dealOrders } from "./dealOrders.model.js";

export const shipments = pgTable('shipments', {
    shipmentid: varchar('shipmentid', 255).primaryKey(), // Primary key
    orderid: varchar("orderid", { length: 255 })
        .notNull()
        .references(() => dealOrders.orderid, { onDelete: "cascade" }), // Foreign key to Orders table
    shipment_date: date('shipment_date').notNull(), // Date of shipment
    quantity_shipped: integer('quantity_shipped').notNull(), // Quantity shipped
    notes: text('notes'), // Optional text notes
    remarks: text('remarks'), // Optional text remarks
    is_active: boolean("is_active").default(true), // Default to active
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});
