import { pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core"; // Import Drizzle ORM core functions

// Define the Client table schema using Drizzle ORM
export const Client = pgTable("Clients", {
    clientid: varchar("clientid", { length: 50 }).primaryKey(), // Client ID
    companyname: varchar("companyname", { length: 255 }).notNull(), // Company name
    address: text("address").notNull(), // Address
    contact: varchar("contact", { length: 20 }).notNull().unique(), // Contact number (unique constraint)
    email: varchar("email", { length: 50 }).notNull().unique(), // Email address (unique constraint)
    status: varchar("status", { length: 50 }).default("active"), // Default status is 'active'
    created_at: timestamp("created_at").defaultNow(), // Automatically set creation timestamp
    updated_at: timestamp("updated_at").defaultNow(), // Automatically set update timestamp
    remarks: text("remarks"), // Remarks (optional)
});


