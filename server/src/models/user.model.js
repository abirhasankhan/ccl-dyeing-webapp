import { pgTable, serial, varchar } from "drizzle-orm/pg-core"; // Import Drizzle ORM core functions
import bcryptjs from "bcryptjs"; // Directly import bcryptjs
import { db } from "../config/drizzleSetup.js"; // Import the Drizzle instance

// Define the User table schema using Drizzle ORM
export const User = pgTable("User", {
    id: serial("id").primaryKey(), // Auto-increment primary key
    username: varchar("username", { length: 255 }), // User's username
    password: varchar("password", { length: 255 }), // User's password (hashed)
    role: varchar("role", { length: 50 }), // User's role (e.g., admin, user)
    status: varchar("status", { length: 50 }).default("inactive"), // Default status is "inactive"
});

// Function to hash passwords using bcryptjs
export const hashPassword = async (password) => {
    return bcryptjs.hash(password, 10); // Hash password with 10 salt rounds
};

// Function to compare passwords using bcryptjs
export const comparePassword = async (password, hashedPassword) => {
    return bcryptjs.compare(password, hashedPassword); // Compare given password with stored hash
};

// Ensure that the table is created manually if it doesn't exist
export const createSchema = async () => {
    try {
        console.log("Checking if the User table exists...");

        // Check if the 'User' table exists by querying the information_schema
        const result = await db.execute(`
            SELECT to_regclass('public."User"');
        `);

        // If the result is null, the table does not exist
        if (result.rows[0].to_regclass === null) {
            console.log("User table does not exist. Creating it...");

            // Raw SQL query to create the User table if it doesn't exist
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS "User" (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(255) NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    role VARCHAR(50) NOT NULL,
                    status VARCHAR(50) DEFAULT 'inactive'
                );
            `;
            await db.execute(createTableQuery); // Execute the query to create the table

            console.log("Schema created successfully.");
        } else {
            console.log("User table already exists. Skipping creation.");
        }
    } catch (error) {
        console.error("Error creating schema:", error);
    }
};
