import { pgTable, serial, varchar, decimal, timestamp, text } from "drizzle-orm/pg-core"; // Import Drizzle ORM core functions

// Define the DyeingFinishingPrices table schema using Drizzle ORM
export const DyeingFinishingPrices = pgTable("dyeing_finishing_prices", {
    df_priceid: serial("df_priceid").primaryKey(), // Primary Key
    color: varchar("color", { length: 255 }).notNull(), // Color
    shade_percent: varchar("shade_percent", { length: 50 }), // Shade percent (optional)
    tube_tk: decimal("tube_tk", { precision: 10, scale: 2 }).notNull(), // Tube Tk
    open_tk: decimal("open_tk", { precision: 10, scale: 2 }).notNull(), // Open Tk
    elasteen_tk: decimal("elasteen_tk", { precision: 10, scale: 2 }).notNull(), // Elasteen Tk
    double_dyeing_tk: decimal("double_dyeing_tk", { precision: 10, scale: 2 }).notNull(), // Double Dyeing Tk
    remarks: text("remarks"), // Remarks (optional)
    is_active: boolean("is_active").default(true), // Default to active
    created_at: timestamp("created_at").defaultNow(), // Automatically set creation timestamp
});
