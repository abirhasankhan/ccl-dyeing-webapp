import { pgTable, varchar, text, timestamp, integer } from "drizzle-orm/pg-core";

export const machines = pgTable("machines", {
    machineid: varchar("machineid", { length: 255 }).primaryKey(),
    machine_name: varchar("machine_name", { length: 255 }).notNull(),
    machine_type: varchar("machine_type", { length: 255 }).notNull(),
    capacity: integer("capacity").notNull(),
    status: varchar("status", { length: 50 }).default("available"),
    manufacturer: varchar("manufacturer", { length: 255 }),
    model: varchar("model", { length: 255 }),
    installation_date: timestamp("installation_date"),
    last_maintenance_date: timestamp("last_maintenance_date"),
    next_maintenance_date: timestamp("next_maintenance_date"),
    remarks: text("remarks"),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});
