import { pgTable, text, varchar, real, integer, timestamp } from "drizzle-orm/pg-core";
import { shipments } from "./shipments.model.js";

export const productDetails = pgTable("product_details", {
    productdetailid: varchar("productdetailid", { length: 255 }).primaryKey(),
    shipmentid: varchar("shipmentid", { length: 255 })
        .notNull()
        .references(() => shipments.shipmentid, { onDelete: "cascade" }),
    yarn_count: varchar("yarn_count", { length: 255 }),
    color: varchar("color", { length: 255 }),
    fabric: varchar("fabric", { length: 255 }),
    gsm: real("gsm"), // Replace float with real
    machine_dia: real("machine_dia"), // Replace float with real
    finish_dia: real("finish_dia"), // Replace float with real
    rolls_received: integer("rolls_received"),
    grey_received_qty: integer("grey_received_qty"),
    grey_return_qty: integer("grey_return_qty").default(0),
    final_qty: integer("final_qty"),
    rejected_qty: integer("rejected_qty"),
    notes: text("notes"),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
    remarks: text("remarks"),
});
