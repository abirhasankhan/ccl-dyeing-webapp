import { db } from "../config/drizzleSetup.js"; // Import the Drizzle instance

export const invoicesSchema = async () => {
    try {
        console.log("Checking if the invoices table exists...");

        // Check if the 'invoices' table exists
        const result = await db.execute(`
            SELECT to_regclass('public."invoices"');
        `);

        if (result.rows[0].to_regclass === null) {

            console.log("invoices table does not exist. Creating it...");

            // Create invoices table
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS invoices (
                    invoiceid VARCHAR(255) PRIMARY KEY, 
                    processid VARCHAR(255) NOT NULL, 
                    amount REAL NOT NULL, 
                    issued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
                    due_date TIMESTAMP NOT NULL, 
                    status VARCHAR(50) DEFAULT 'Unpaid', 
                    notes TEXT,
                    remarks TEXT,                       
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
                    FOREIGN KEY (processid) REFERENCES dyeing_process(processid) ON DELETE CASCADE
                );
            `;

            // Create sequence for invoice IDs
            const createSequenceQuery = `
                CREATE SEQUENCE invoice_seq START 1;
            `;

            // Function to generate invoiceid
            const createFunctionGeneratePrimaryIdQuery = `
                CREATE OR REPLACE FUNCTION generate_invoice_id() RETURNS TRIGGER AS $$
                BEGIN
                    NEW.invoiceid := CONCAT('INV-25-', LPAD(NEXTVAL('invoice_seq')::TEXT, 4, '0'));
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            `;

            // Trigger to auto-generate invoiceid
            const createTriggerGeneratePrimaryIdQuery = `
                CREATE TRIGGER trigger_generate_invoice_id
                BEFORE INSERT ON invoices
                FOR EACH ROW
                EXECUTE FUNCTION generate_invoice_id();
            `;

            // Function to update 'updated_at' column automatically
            const createFunctionUpdateTimestampQuery = `
                CREATE OR REPLACE FUNCTION update_invoice_timestamp()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at = CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            `;

            // Trigger to update 'updated_at' column before update
            const createTriggerUpdateTimestampQuery = `
                CREATE TRIGGER trigger_update_invoice_timestamp
                BEFORE UPDATE ON invoices
                FOR EACH ROW
                EXECUTE FUNCTION update_invoice_timestamp();
            `;

            // Execute all queries
            await db.execute(createTableQuery); // Create Clients table
            await db.execute(createSequenceQuery); // Create sequence for Primary IDs
            await db.execute(createFunctionGeneratePrimaryIdQuery); // Create Primary ID generation function
            await db.execute(createTriggerGeneratePrimaryIdQuery); // Create trigger for Primary ID generation
            await db.execute(createFunctionUpdateTimestampQuery); // Create timestamp update function
            await db.execute(createTriggerUpdateTimestampQuery); // Create trigger for updated_at column

            console.log("invoices schema created successfully.");
        } else {
            console.log("invoices table already exists. Skipping creation.");
        }
    } catch (error) {
        console.error("Error creating invoices schema:", error);
    }
};
