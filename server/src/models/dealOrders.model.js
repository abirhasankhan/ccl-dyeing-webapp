import {
    pgTable,
    text,
    varchar,
    integer,
    timestamp,
} from "drizzle-orm/pg-core";
import { clientDeals } from "./clientDeals.model.js";


// Define the `Orders` table
export const dealOrders = pgTable("deal_orders", {
    orderid: varchar("orderid", { length: 255 }).primaryKey(),
    deal_id: varchar("deal_id", { length: 255 })
        .notNull()
        .references(() => clientDeals.deal_id, { onDelete: "cascade" }),
    challan_no: varchar("challan_no", { length: 255 }).notNull().unique(),
    booking_qty: integer("booking_qty").notNull(),
    total_received_qty: integer("total_received_qty").default(0),
    total_returned_qty: integer("total_returned_qty").default(0),
    status: varchar("status", { length: 50 }).default("Pending"),
    notes: text("notes"),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
    remarks: text("remarks"),
});
