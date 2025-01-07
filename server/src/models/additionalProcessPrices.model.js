import { pgTable, serial, varchar, decimal, timestamp, text } from "drizzle-orm/pg-core";

// Define the AdditionalProcessPrices table schema using Drizzle ORM
export const AdditionalProcessPrices = pgTable("additional_process_prices", {
    ap_priceid: serial("ap_priceid").primaryKey(),  // Auto-incrementing primary key
    process_type: varchar("process_type", { length: 255 }).notNull(),  // Process type (required)
    price_tk: decimal("price_tk", { precision: 10, scale: 2 }).notNull(),  // Price in Tk (required)
    created_at: timestamp("created_at").defaultNow(),  // Auto-generated timestamp
    remarks: text("remarks"),  // Optional remarks field
});
