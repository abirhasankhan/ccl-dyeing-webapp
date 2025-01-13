import { db } from "../config/drizzleSetup.js"; // Import the Drizzle instance

// Function to create the Client table manually (if necessary)
export const createClientDealsSchema = async () => {
    try {
        console.log("Checking if the ClientDeals table exists...");

        // Check if the 'Clients' table exists by querying the information_schema
        const result = await db.execute(`
            SELECT to_regclass('public."ClientDeals"');
        `);

        // If the result is null, the table does not exist
        if (result.rows[0].to_regclass === null) {

            console.log("ClientDeals table does not exist. Creating it...");

            // Raw SQL query to create the Clients table with unique constraints
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS "ClientDeals" (
                    deal_id VARCHAR(20) PRIMARY KEY,
                    clientid VARCHAR(20) NOT NULL,
                    payment_method VARCHAR(10) CHECK (payment_method IN ('Cash', 'Bank', 'Hybrid')) NOT NULL,
                    issue_date DATE,
                    valid_through DATE,
                    representative VARCHAR(100),
                    designation VARCHAR(100),
                    contact_no VARCHAR(15),
                    bank_info JSONB,
                    notes TEXT,
                    remarks TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (clientid) REFERENCES Clients(clientid)
                );
            `;

            // Sequence for generating deals IDs
            const createSequenceQuery = `
                CREATE SEQUENCE deal_id_seq START 1;
            `;

            // Function to set deal_id before insert
            const createFunctionGenerateClientIdQuery = `
                CREATE OR REPLACE FUNCTION generate_deal_id()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.deal_id := CONCAT('DEAL', LPAD(nextval('deal_id_seq')::TEXT, 6, '0'));
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            `;

            // Create the trigger for ClientDeals
            const createTriggerGenerateClientIdQuery = `
                CREATE TRIGGER set_deal_id
                BEFORE INSERT ON ClientDeals
                FOR EACH ROW
                EXECUTE FUNCTION generate_deal_id();
            `;

            // Function to update updated_at column on record update
            const createFunctionUpdateTimestampQuery = `
                CREATE OR REPLACE FUNCTION update_deal_timestamp()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at := CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            `;

            // Trigger to update updated_at on record update
            const createTriggerUpdateTimestampQuery = `
                CREATE TRIGGER trigger_update_deal_timestamp
                BEFORE UPDATE ON ClientDeals
                FOR EACH ROW
                EXECUTE FUNCTION update_deal_timestamp();
            `;

            // Execute all queries
            await db.execute(createTableQuery); // Create Clients table
            await db.execute(createSequenceQuery); // Create sequence for client IDs
            await db.execute(createFunctionGenerateClientIdQuery); // Create client ID generation function
            await db.execute(createTriggerGenerateClientIdQuery); // Create trigger for client ID generation
            await db.execute(createFunctionUpdateTimestampQuery); // Create timestamp update function
            await db.execute(createTriggerUpdateTimestampQuery); // Create trigger for updated_at column

            console.log("ClientDeals schema created successfully.");
        } else {
            console.log("ClientDeals table already exists. Skipping creation.");
        }
    } catch (error) {
        console.error("Error creating ClientDeals schema:", error);
    }
};
