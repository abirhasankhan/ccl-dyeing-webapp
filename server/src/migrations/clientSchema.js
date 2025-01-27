import { db } from "../config/drizzleSetup.js"; // Import the Drizzle instance

// Function to create the Client table manually (if necessary)
export const clientSchema = async () => {
    try {
        console.log("Checking if the clients table exists...");

        // Check if the 'Clients' table exists by querying the information_schema
        const result = await db.execute(`
            SELECT to_regclass('public."clients"');
        `);

        // If the result is null, the table does not exist
        if (result.rows[0].to_regclass === null) {

            console.log("clients table does not exist. Creating it...");

            // Raw SQL query to create the Clients table with unique constraints
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS "clients" (
                    clientid VARCHAR(255) PRIMARY KEY,
                    companyname VARCHAR(255) NOT NULL,
                    address TEXT NOT NULL,
                    contact VARCHAR(20) NOT NULL UNIQUE, -- Unique constraint for contact
                    email VARCHAR(50) NOT NULL UNIQUE, -- Unique constraint for email
                    status VARCHAR(50) DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    remarks TEXT
                );
            `;

            // Sequence for generating client IDs
            const createSequenceQuery = `
                CREATE SEQUENCE clients_seq START 1;
            `;

            // Function to generate client ID
            const createFunctionGenerateClientIdQuery = `
                CREATE OR REPLACE FUNCTION generate_client_id() RETURNS TRIGGER AS $$
                BEGIN
                    NEW.clientid := CONCAT('CL-', LPAD(NEXTVAL('clients_seq')::TEXT, 4, '0'));
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            `;

            // Trigger to auto-generate client ID
            const createTriggerGenerateClientIdQuery = `
                CREATE TRIGGER trigger_generate_client_id
                BEFORE INSERT ON "clients"
                FOR EACH ROW
                EXECUTE FUNCTION generate_client_id();
            `;

            // Function to update updated_at column on record update
            const createFunctionUpdateTimestampQuery = `
                CREATE OR REPLACE FUNCTION update_timestamp()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at := CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            `;

            // Trigger to update updated_at on record update
            const createTriggerUpdateTimestampQuery = `
                CREATE TRIGGER trigger_update_timestamp
                BEFORE UPDATE ON "clients"
                FOR EACH ROW
                EXECUTE FUNCTION update_timestamp();
            `;

            // Execute all queries
            await db.execute(createTableQuery); // Create Clients table
            await db.execute(createSequenceQuery); // Create sequence for client IDs
            await db.execute(createFunctionGenerateClientIdQuery); // Create client ID generation function
            await db.execute(createTriggerGenerateClientIdQuery); // Create trigger for client ID generation
            await db.execute(createFunctionUpdateTimestampQuery); // Create timestamp update function
            await db.execute(createTriggerUpdateTimestampQuery); // Create trigger for updated_at column

            console.log("clients schema created successfully.");
        } else {
            console.log("clients table already exists. Skipping creation.");
        }
    } catch (error) {
        console.error("Error creating clients schema:", error);
    }
};
