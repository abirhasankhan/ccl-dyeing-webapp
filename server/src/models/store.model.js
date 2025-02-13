import {
    pgTable,
    varchar,
    integer,
    timestamp,
    text,
    boolean
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

import { dyeingProcess } from "./dyeingProcess.model.js";

export const store = pgTable("store", {
    storeid: varchar("storeid", { length: 255 }).primaryKey(), // Primary Key
    processid: varchar("processid", { length: 255 })
        .notNull()
        .references(() => dyeingProcess.processid, { onDelete: "cascade" }), // Foreign Key
    product_location: varchar("product_location", { length: 255 }).notNull(), // Product Location
    qty: integer("qty").notNull(), // Quantity in store
    status: varchar("status", { length: 50 }).default("In Store"), // Status: 'In Store' or 'Delivered'
    notes: text("notes"), // Additional notes
    remarks: text("remarks"), // Remarks
    is_active: boolean("is_active").default(true), // Default to active
    created_at: timestamp("created_at").defaultNow(), // Timestamp for record creation
    updated_at: timestamp("updated_at").defaultNow(), // Timestamp for updates
});

// Define relationships (if needed)
export const storeRelations = relations(store, ({ one }) => ({
    dyeingProcess: one(dyeingProcess, {
        fields: [store.processid],
        references: [dyeingProcess.processid],
    }),
}));
