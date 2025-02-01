import { db } from "../config/drizzleSetup.js"; // Import the Drizzle instance

export const storeSchema = async () => {
    try {
        console.log("Checking if the store table exists...");

        // Check if the 'store' table exists
        const result = await db.execute(`
            SELECT to_regclass('public."store"');
        `);

        if (result.rows[0].to_regclass === null) {
            console.log("store table does not exist. Creating it...");

            // Create the store table
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS store (
                    storeid VARCHAR(255) PRIMARY KEY,  -- Unique store ID
                    processid VARCHAR(255) NOT NULL,  -- Links to DyeingCompletion table
                    product_location VARCHAR(255) NOT NULL,  -- Location of the product
                    qty INT NOT NULL,  -- Quantity in store
                    status VARCHAR(50) DEFAULT 'In Store',  -- Status: 'In Store' or 'Delivered'
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Timestamp for record creation
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Timestamp for updates
                    remarks TEXT,                       -- Additional notes
                    FOREIGN KEY (processid) REFERENCES dyeing_process(processid) ON DELETE CASCADE
                );
            `;

            // Create sequence for generating storeid
            const createSequenceQuery = `
                CREATE SEQUENCE store_seq START 1;
            `;

            // Function to generate storeid
            const createFunctionGeneratePrimaryIdQuery = `
                CREATE OR REPLACE FUNCTION generate_store_id() RETURNS TRIGGER AS $$
                BEGIN
                    NEW.storeid := CONCAT('ST-', LPAD(NEXTVAL('store_seq')::TEXT, 6, '0'));
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            `;

            // Trigger to auto-generate storeid
            const createTriggerGeneratePrimaryIdQuery = `
                CREATE TRIGGER trigger_generate_store_id
                BEFORE INSERT ON store
                FOR EACH ROW
                EXECUTE FUNCTION generate_store_id();
            `;

            // Function to update 'updated_at' column
            const createFunctionUpdateTimestampQuery = `
                CREATE OR REPLACE FUNCTION update_store_timestamp()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at = CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            `;

            // Trigger to update 'updated_at' column
            const createTriggerUpdateTimestampQuery = `
                CREATE TRIGGER trigger_update_store_timestamp
                BEFORE UPDATE ON store
                FOR EACH ROW
                EXECUTE FUNCTION update_store_timestamp();
            `;

            // Execute all queries
            await db.execute(createTableQuery); // Create store table
            await db.execute(createSequenceQuery); // Create sequence for storeid
            await db.execute(createFunctionGeneratePrimaryIdQuery); // Create storeid generation function
            await db.execute(createTriggerGeneratePrimaryIdQuery); // Create trigger for storeid generation
            await db.execute(createFunctionUpdateTimestampQuery); // Create timestamp update function
            await db.execute(createTriggerUpdateTimestampQuery); // Create trigger for updated_at column

            console.log("store schema created successfully.");
        } else {
            console.log("store table already exists. Skipping creation.");
        }
    } catch (error) {
        console.error("Error creating store schema:", error);
    }
};
