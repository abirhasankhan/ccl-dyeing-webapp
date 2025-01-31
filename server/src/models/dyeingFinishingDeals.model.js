import { pgTable, varchar, decimal, timestamp, text } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
// Import the related table for foreign key reference
import { clientDeals } from "./clientDeals.model.js";

export const dyeingFinishingDeals = pgTable("dyeing_finishing_deals", {
    dfpid: varchar("dfpid", { length: 255 }).primaryKey(),
    deal_id: varchar("deal_id", { length: 255 }).notNull().references(() => clientDeals.deal_id),
    color: varchar("color", { length: 255 }).notNull(),
    shade_percent: varchar("shade_percent", { length: 50 }),
    tube_tk: decimal("tube_tk", { precision: 10, scale: 2 }).notNull(), // Tube Tk
    open_tk: decimal("open_tk", { precision: 10, scale: 2 }).notNull(), // Open Tk
    elasteen_tk: decimal("elasteen_tk", { precision: 10, scale: 2 }).notNull(), // Elasteen Tk
    double_dyeing_tk: decimal("double_dyeing_tk", { precision: 10, scale: 2 }).notNull(), // Double Dyeing Tk
    notes: text('notes'),
    remarks: text("remarks"),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});
