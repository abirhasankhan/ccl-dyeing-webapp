import { pgTable, varchar, timestamp, real, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { dyeingProcess } from "./dyeingProcess.model.js"; // Assuming dyeingProcess is linked

export const invoices = pgTable("invoices", {
    invoiceid: varchar("invoiceid", { length: 255 }).primaryKey(), // Primary Key
    processid: varchar("processid", { length: 255 })
        .notNull()
        .references(() => dyeingProcess.processid, { onDelete: "cascade" }), // Foreign Key
    amount: real("amount").notNull(), // Total amount
    issued_date: timestamp("issued_date").defaultNow(), // Invoice issued date
    due_date: timestamp("due_date").notNull(), // Due date for payment
    status: varchar("status", { length: 50 }).default("Unpaid"), // Status: Unpaid, Paid, Partially Paid
    notes: text("notes"), // Additional notes
    remarks: text("remarks"), // Remarks
    created_at: timestamp("created_at").defaultNow(), // Timestamp for record creation
    updated_at: timestamp("updated_at").defaultNow(), // Timestamp for updates
});

// Define relationships (if needed)
export const invoiceRelations = relations(invoices, ({ one }) => ({
    dyeingProcess: one(dyeingProcess, {
        fields: [invoices.processid],
        references: [dyeingProcess.processid],
    }),
}));