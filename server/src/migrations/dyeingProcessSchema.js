import { db } from "../config/drizzleSetup.js"; // Import the Drizzle instance


export const dyeingProcessSchema = async () => {

    try {
        console.log("Checking if the dyeing_process table exists...");

        // Check if the 'dyeing_process' table exists by querying the information_schema
        const result = await db.execute(`
            SELECT to_regclass('public."dyeing_process"');
        `);

        // If the result is null, the table does not exist
        if (result.rows[0].to_regclass === null) {

            console.log("dyeing_process table does not exist. Creating it...");

            // Raw SQL query to create the dyeing_process table with unique constraints
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS dyeing_process (
                    processid VARCHAR(255) PRIMARY KEY, -- Unique ID for the dyeing process
                    productdetailid VARCHAR(255) NOT NULL,    -- Links to the Products table
                    machineid VARCHAR(255) NOT NULL,    -- Machine used for dyeing
                    batch_qty INT NOT NULL,             -- Quantity in the batch
                    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Start time of the process
                    end_time TIMESTAMP,                 -- End time of the process
                    grey_weight FLOAT,                  -- Weight of grey fabric
                    finish_weight FLOAT,                -- Weight after dyeing
                    finish_after_gsm FLOAT,             -- Actual GSM after finishing
                    status VARCHAR(50) DEFAULT 'In Progress', -- Status of the dyeing process (e.g., In Progress, Completed)
                    process_loss FLOAT GENERATED ALWAYS AS ((grey_weight - finish_weight) / NULLIF(grey_weight, 0) * 100) STORED, -- Calculated process loss
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp for record creation
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp for updates
                    remarks TEXT,                       -- Additional notes
                    FOREIGN KEY (productdetailid) REFERENCES product_details(productdetailid)  ON DELETE CASCADE, -- Links to the Products table
                    FOREIGN KEY (machineid) REFERENCES machines(machineid)  ON DELETE CASCADE -- Links to the Machines table
                );
            `;

            // Sequence for generating processid

            const createSequenceQuery = `
                CREATE SEQUENCE dyeing_process_seq START 1;
            `;

            // Function to generate processid
            const createFunctionGeneratePrimaryIdQuery = `
                CREATE OR REPLACE FUNCTION generate_process_id() RETURNS TRIGGER AS $$
                BEGIN
                    NEW.processid := CONCAT('DP-', LPAD(NEXTVAL('dyeing_process_seq')::TEXT, 6, '0'));
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            `;

            // Trigger to auto-generate processid
            const createTriggerGeneratePrimaryIdQuery = `
                CREATE TRIGGER trigger_generate_process_id
                BEFORE INSERT ON dyeing_process
                FOR EACH ROW
                EXECUTE FUNCTION generate_process_id();
            `;


            // Function to update 'updated_at' column
            const createFunctionUpdateTimestampQuery = `
                CREATE OR REPLACE FUNCTION update_dyeing_process_timestamp()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at = CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            `;

            // Tigger to update 'updated_at' column
            const createTriggerUpdateTimestampQuery = `
                CREATE TRIGGER trigger_update_dyeing_process_timestamp
                BEFORE UPDATE ON dyeing_process
                FOR EACH ROW
                EXECUTE FUNCTION update_dyeing_process_timestamp();
            `;

            // Execute all queries
            await db.execute(createTableQuery); // Create Clients table
            await db.execute(createSequenceQuery); // Create sequence for Primary IDs
            await db.execute(createFunctionGeneratePrimaryIdQuery); // Create Primary ID generation function
            await db.execute(createTriggerGeneratePrimaryIdQuery); // Create trigger for Primary ID generation
            await db.execute(createFunctionUpdateTimestampQuery); // Create timestamp update function
            await db.execute(createTriggerUpdateTimestampQuery); // Create trigger for updated_at column

            console.log("dyeing_process schema created successfully.");
        } else {
            console.log("dyeing_process table already exists. Skipping creation.");
        }
    } catch (error) {
        console.error("Error creating dyeing_process schema:", error);
    }
};
