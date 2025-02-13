import { db } from "../config/drizzleSetup.js"; // Import the Drizzle instance

export const userSchema = async () => {
    try {
        console.log("Checking if the users table exists...");

        // Check if the 'user' table exists
        const result = await db.execute(`
            SELECT to_regclass('public."users"');
        `);

        if (result.rows[0].to_regclass === null) {
            console.log("users table does not exist. Creating it...");

            // Create the store table
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS users (
                    userid SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    username VARCHAR(255) NOT NULL UNIQUE,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    role VARCHAR(255) NOT NULL DEFAULT 'user',
                    status VARCHAR(50) DEFAULT 'active',
                    remarks TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `;

            // Function to update 'updated_at' column
            const createFunctionUpdateTimestampQuery = `
                CREATE OR REPLACE FUNCTION update_users_timestamp()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at = CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            `;

            // Trigger to update 'updated_at' column
            const createTriggerUpdateTimestampQuery = `
                CREATE TRIGGER trigger_update_users_timestamp
                BEFORE UPDATE ON users
                FOR EACH ROW
                EXECUTE FUNCTION update_users_timestamp();
            `;

            // Execute all queries
            await db.execute(createTableQuery); // Create store table
            await db.execute(createFunctionUpdateTimestampQuery); // Create timestamp update function
            await db.execute(createTriggerUpdateTimestampQuery); // Create trigger for updated_at column

            console.log("users schema created successfully.");
        } else {
            console.log("users table already exists. Skipping creation.");
        }
    } catch (error) {
        console.error("Error creating users schema:", error);
    }
};
