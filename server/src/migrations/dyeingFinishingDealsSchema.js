import { db } from "../config/drizzleSetup.js"; // Import the Drizzle instance

// Function to create the Client table manually (if necessary)
export const dyeingFinishingDealsSchema = async () => {
    try {
        console.log("Checking if the dyeing_finishing_deals table exists...");

        // Check if the 'Clients' table exists by querying the information_schema
        const result = await db.execute(`
            SELECT to_regclass('public."dyeing_finishing_deals"');
        `);

        // If the result is null, the table does not exist
        if (result.rows[0].to_regclass === null) {

            console.log("dyeing_finishing_selections table does not exist. Creating it...");

            // Raw SQL query to create the Clients table with unique constraints
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS "dyeing_finishing_deals" (
                    dfpid VARCHAR(255) PRIMARY KEY,
                    deal_id VARCHAR(255) NOT NULL,
                    color VARCHAR(255) NOT NULL,
                    shade_percent VARCHAR(50),
                    service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('tube_tk', 'open_tk', 'elasteen_tk')),
                    service_price_tk DECIMAL(10, 2) NOT NULL,
                    double_dyeing_tk DECIMAL(10, 2) DEFAULT 0,
                    total_price DECIMAL(10, 2) NOT NULL GENERATED ALWAYS AS (service_price_tk + double_dyeing_tk) STORED,
                    notes TEXT,
                    remarks TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (deal_id) REFERENCES client_deals(deal_id)
                );
            `;

            // Create a sequence for generating unique dfp IDs
            const createSequenceQuery = `
                CREATE SEQUENCE dfpid_seq START 1;
            `;

            // Create a function to set dfpid before insert
            const createFunctionGenerateClientIdQuery = `
                CREATE OR REPLACE FUNCTION generate_dfpid()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.dfpid := CONCAT('DFP', LPAD(nextval('dfpid_seq')::TEXT, 6, '0'));
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            `;

            // Create the trigger for dyeing_finishing_deals
            const createTriggerGenerateClientIdQuery = `
                CREATE TRIGGER set_dfpid
                BEFORE INSERT ON dyeing_finishing_deals
                FOR EACH ROW
                EXECUTE FUNCTION generate_dfpid();
            `;

            // Function to update updated_at column on record update
            const createFunctionUpdateTimestampQuery = `
                CREATE OR REPLACE FUNCTION update_dyeingfinishingselection_timestamp()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at := CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            `;

            // Trigger to update updated_at on record update
            const createTriggerUpdateTimestampQuery = `
                CREATE TRIGGER trigger_update_dyeingfinishingselection_timestamp
                BEFORE UPDATE ON dyeing_finishing_deals
                FOR EACH ROW
                EXECUTE FUNCTION update_dyeingfinishingselection_timestamp();
            `;

            // Execute all queries
            await db.execute(createTableQuery); // Create Clients table
            await db.execute(createSequenceQuery); // Create sequence for client IDs
            await db.execute(createFunctionGenerateClientIdQuery); // Create client ID generation function
            await db.execute(createTriggerGenerateClientIdQuery); // Create trigger for client ID generation
            await db.execute(createFunctionUpdateTimestampQuery); // Create timestamp update function
            await db.execute(createTriggerUpdateTimestampQuery); // Create trigger for updated_at column

            console.log("dyeing_finishing_deals schema created successfully.");
        } else {
            console.log("dyeing_finishing_deals table already exists. Skipping creation.");
        }
    } catch (error) {
        console.error("Error creating dyeing_finishing_deals schema:", error);
    }
};
