import { db } from "../config/drizzleSetup.js"; // Import the Drizzle instance

export const machinesSchema = async () => {

    try {
        console.log("Checking if the machines table exists...");

        // Check if the 'machines' table exists by querying the information_schema
        const result = await db.execute(`
            SELECT to_regclass('public."machines"');
        `);

        // If the result is null, the table does not exist
        if (result.rows[0].to_regclass === null) {

            console.log("machines table does not exist. Creating it...");

            // Raw SQL query to create the machines table with unique constraints
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS machines (
                    machineid VARCHAR(255) PRIMARY KEY NOT NULL, -- Primary key for the machine
                    name VARCHAR(255) NOT NULL, -- Name of the machine
                    type VARCHAR(255) NOT NULL, -- Type of the machine (e.g., spinning, weaving, etc.)
                    capacity INT NOT NULL, -- Capacity of the machine (e.g., units per hour)
                    status VARCHAR(50) DEFAULT 'available', -- Status of the machine (e.g., available, busy, maintenance)
                    manufacturer VARCHAR(255), -- Manufacturer of the machine
                    model VARCHAR(255), -- Model of the machine
                    installation_date TIMESTAMP, -- Date when the machine was installed
                    last_maintenance_date TIMESTAMP, -- Date of the last maintenance
                    next_maintenance_date TIMESTAMP, -- Date of the next scheduled maintenance
                    remarks TEXT, -- Remarks or comments
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the record was created
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp when the record was last updated
                );
            `;

            // Function to update updated_at timestamp
            const createFunctionUpdateTimestampQuery = `
                CREATE OR REPLACE FUNCTION update_machines_timestamp()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at = CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            `;

            // Trigger to update updated_at before update
            const createTriggerUpdateTimestampQuery = `
                CREATE TRIGGER trigger_update_machines_timestamp
                BEFORE UPDATE ON machines
                FOR EACH ROW
                EXECUTE FUNCTION update_machines_timestamp();
            `;

            // Execute all queries
            await db.execute(createTableQuery); // Create Clients table
            await db.execute(createFunctionUpdateTimestampQuery); // Create timestamp update function
            await db.execute(createTriggerUpdateTimestampQuery); // Create trigger for updated_at column

            console.log("machines schema created successfully.");
        } else {
            console.log("machines table already exists. Skipping creation.");
        }
    } catch (error) {
        console.error("Error creating machines schema:", error);
    }
};
