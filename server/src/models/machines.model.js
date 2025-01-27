import { pgTable, varchar, text, timestamp, integer } from "drizzle-orm/pg-core";

export const machines = pgTable("machines", {
    machineid: varchar("machineid", { length: 255 }).primaryKey(), // Primary key for the machine
    machine_name: varchar("name", { length: 255 }).notNull(), // Name of the machine
    type: varchar("type", { length: 255 }).notNull(), // Type of the machine (e.g., spinning, weaving, etc.)
    capacity: integer("capacity").notNull(), // Capacity of the machine (e.g., units per hour)
    status: varchar("status", { length: 50 }).default("available"), // Status of the machine (e.g., available, busy, maintenance)
    manufacturer: varchar("manufacturer", { length: 255 }), // Manufacturer of the machine
    model: varchar("model", { length: 255 }), // Model of the machine
    installation_date: timestamp("installation_date"), // Date when the machine was installed
    last_maintenance_date: timestamp("last_maintenance_date"), // Date of the last maintenance
    next_maintenance_date: timestamp("next_maintenance_date"), // Date of the next scheduled maintenance
    remarks: text("remarks"), // Remarks or comments
    created_at: timestamp("created_at").defaultNow(), // Timestamp when the record was created
    updated_at: timestamp("updated_at").defaultNow(), // Timestamp when the record was last updated
});