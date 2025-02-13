import {
    pgTable,
    varchar,
    integer,
    timestamp,
    real,
    text,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

import { productDetails } from "./productDetails.model.js";
import { machines } from "./machines.model.js";

export const dyeingProcess = pgTable("dyeing_process", {
    processid: varchar("processid", { length: 255 }).primaryKey(), // Primary Key
    productdetailid: varchar("productdetailid", { length: 255 })
        .notNull()
        .references(() => productDetails.productdetailid, { onDelete: "cascade" }), // Foreign Key
    machineid: varchar("machineid", { length: 255 })
        .notNull()
        .references(() => machines.machineid, { onDelete: "cascade" }), // Foreign Key
    batch_qty: integer("batch_qty").notNull(), // Quantity in the batch
    start_time: timestamp("start_time").defaultNow(), // Start time of the process
    end_time: timestamp("end_time"), // End time of the process
    grey_weight: real("grey_weight"), // Weight of grey fabric
    finish_weight: real("finish_weight"), // Weight after dyeing
    finish_after_gsm: real("finish_after_gsm"), // GSM after finishing
    process_loss: real("process_loss"), // Process loss %
    final_qty: integer("final_qty"), // ✅ Total successful fabric quantity after dyeing
    rejected_qty: integer("rejected_qty"), // ✅ Fabric rejected after dyeing
    status: varchar("status", { length: 50 }).default("In Progress"), // Status of the dyeing process
    notes: text("notes"), // Additional notes
    remarks: text("remarks"), // Remarks
    is_active: boolean("is_active").default(true), // Default to active
    created_at: timestamp("created_at").defaultNow(), // Timestamp for record creation
    updated_at: timestamp("updated_at").defaultNow(), // Timestamp for updates

});


// Define relationships (if needed)
export const dyeingProcessRelations = relations(dyeingProcess, ({ one }) => ({
    productDetails: one(productDetails, {
        fields: [dyeingProcess.productdetailid],
        references: [productDetails.productdetailid],
    }),
    machines: one(machines, {
        fields: [dyeingProcess.machineid],
        references: [machines.machineid],
    }),
}));
