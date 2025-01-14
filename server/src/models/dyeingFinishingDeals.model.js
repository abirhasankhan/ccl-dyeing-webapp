import { pgTable, varchar, decimal, timestamp, text, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
// Import the related table for foreign key reference
import { clientDeals } from "./clientDeals.model.js";

export const serviceTypeEnum = pgEnum('service_type', ['tube_tk', 'open_tk', 'elasteen_tk']);

export const dyeingFinishingDeals = pgTable("dyeing_finishing_deals", {
    dfpid: varchar("dfpid", { length: 20 }).primaryKey(),
    deal_id: varchar("deal_id", { length: 20 }).notNull().references(() => clientDeals.deal_id),
    color: varchar("color", { length: 50 }).notNull(),
    shade_percent: varchar("shade_percent", { length: 50 }),
    service_type: serviceTypeEnum().notNull(),
    service_price_tk: decimal("service_price_tk", { precision: 10, scale: 2 }).notNull(),
    double_dyeing_tk: decimal("double_dyeing_tk", { precision: 10, scale: 2 }).default("0"),
    total_price: decimal("total_price", { precision: 10, scale: 2 }).notNull().generatedAlwaysAs(sql`service_price_tk + double_dyeing_tk`),
    notes: text('notes'),
    remarks: text("remarks"),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});
