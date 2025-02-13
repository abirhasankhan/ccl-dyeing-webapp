import { pgTable, serial, varchar, integer, text, timestamp, date } from "drizzle-orm/pg-core";
import { dealOrders } from "./dealOrders.model.js";

export const returns = pgTable(
    "returns",
    {
        returnid: serial("returnid").primaryKey(), // SERIAL PRIMARY KEY
        orderid: varchar("orderid", { length: 255 })
            .notNull()
            .references(() => dealOrders.orderid, { onDelete: "cascade" }), // Foreign key to Orders table
        return_date: date("return_date").notNull(), // DATE NOT NULL
        qty_returned: integer("qty_returned").notNull(), // Integer column
        reason_for_return: text("reason_for_return"), // Optional TEXT
        remarks: text("remarks"), // Optional TEXT
        is_active: boolean("is_active").default(true), // Default to active
        created_at: timestamp("created_at").defaultNow(), // DEFAULT CURRENT_TIMESTAMP
        updated_at: timestamp("updated_at").defaultNow(), // DEFAULT CURRENT_TIMESTAMP
    },
    {
        checks: [
            `qty_returned >= 0`, // Add the CHECK constraint at the table level
        ],
    }
);
