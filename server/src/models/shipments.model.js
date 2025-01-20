import { pgTable, varchar, date, integer, text, timestamp, foreignKey } from 'drizzle-orm/pg-core';
import { deal_orders } from "./dealOrders.model.js";

export const shipments = pgTable('shipments', {
    shipmentid: varchar('shipmentid', 20).primaryKey(), // Primary key
    orderid: varchar("orderid", { length: 20 })
        .notNull()
        .references(() => deal_orders.orderid, { onDelete: "cascade" }), // Foreign key to Orders table
    shipment_date: date('shipment_date').notNull(), // Date of shipment
    quantity_shipped: integer('quantity_shipped').notNull(), // Quantity shipped
    notes: text('notes'), // Optional text notes
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
    remarks: text('remarks'), // Optional text remarks
});
