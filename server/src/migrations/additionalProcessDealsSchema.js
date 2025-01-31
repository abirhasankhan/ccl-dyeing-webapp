import { db } from "../config/drizzleSetup.js"; // Import the Drizzle instance

// Function to create the Client table manually (if necessary)
export const additionalProcessDealsSchema = async () => {
    try {
        console.log("Checking if the additional_process_deals table exists...");

        // Check if the 'Clients' table exists by querying the information_schema
        const result = await db.execute(`
            SELECT to_regclass('public."additional_process_deals"');
        `);

        // If the result is null, the table does not exist
        if (result.rows[0].to_regclass === null) {

            console.log("additional_process_deals table does not exist. Creating it...");

            // Raw SQL query to create the Clients table with unique constraints
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS "additional_process_deals" (
                    appid VARCHAR(255) PRIMARY KEY,
                    deal_id VARCHAR(255) NOT NULL,
                    process_type VARCHAR(255),
                    price_tk DECIMAL(10, 2),
                    notes TEXT,
                    remarks TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (deal_id) REFERENCES client_deals(deal_id)
                );
            `;

            // Create a sequence for generating unique app IDs
            const createSequenceQuery = `
                CREATE SEQUENCE appid_seq START 1;
            `;

            // Create a function to set appid before insert
            const createFunctionGenerateClientIdQuery = `
                CREATE OR REPLACE FUNCTION generate_appid()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.appid := CONCAT('APS', LPAD(nextval('appid_seq')::TEXT, 6, '0'));
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            `;

            // Create the trigger for AdditionalProcessDeals
            const createTriggerGenerateClientIdQuery = `
                CREATE TRIGGER set_appid
                BEFORE INSERT ON additional_process_deals
                FOR EACH ROW
                EXECUTE FUNCTION generate_appid();
            `;

            // Function to update updated_at column on record update
            const createFunctionUpdateTimestampQuery = `
                CREATE OR REPLACE FUNCTION update_appid_timestamp()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at := CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            `;

            // Trigger to update updated_at on record update
            const createTriggerUpdateTimestampQuery = `
                CREATE TRIGGER trigger_update_appid_timestamp
                BEFORE UPDATE ON additional_process_deals
                FOR EACH ROW
                EXECUTE FUNCTION update_appid_timestamp();
            `;

            // Execute all queries
            await db.execute(createTableQuery); // Create Clients table
            await db.execute(createSequenceQuery); // Create sequence for client IDs
            await db.execute(createFunctionGenerateClientIdQuery); // Create client ID generation function
            await db.execute(createTriggerGenerateClientIdQuery); // Create trigger for client ID generation
            await db.execute(createFunctionUpdateTimestampQuery); // Create timestamp update function
            await db.execute(createTriggerUpdateTimestampQuery); // Create trigger for updated_at column

            console.log("additional_process_deals schema created successfully.");
        } else {
            console.log("additional_process_deals table already exists. Skipping creation.");
        }
    } catch (error) {
        console.error("Error creating additional_process_deals schema:", error);
    }
};
