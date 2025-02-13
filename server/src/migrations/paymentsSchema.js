import { db } from "../config/drizzleSetup.js"; // Import the Drizzle instance

export const paymentsSchema = async () => {
    try {
        console.log("Checking if the payments table exists...");

        // Check if the 'payments' table exists
        const result = await db.execute(`
            SELECT to_regclass('public."payments"');
        `);

        if (result.rows[0].to_regclass === null) {
            console.log("payments table does not exist. Creating it...");

            // Create payments table
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS payments (
                    paymentid VARCHAR(255) PRIMARY KEY,
                    invoiceid VARCHAR(255) NOT NULL,
                    amount REAL NOT NULL,
                    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    payment_method VARCHAR(50) NOT NULL,
                    notes TEXT,
                    remarks TEXT,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (invoiceid) REFERENCES invoices(invoiceid) ON DELETE CASCADE
                );
            `;

            // Create sequence for payment IDs
            const createSequenceQuery = `
                CREATE SEQUENCE payment_seq START 1;
            `;

            // Function to generate paymentid
            const createFunctionGeneratePrimaryIdQuery = `
                CREATE OR REPLACE FUNCTION generate_payment_id() RETURNS TRIGGER AS $$
                BEGIN
                    NEW.paymentid := CONCAT('PAY-25-', LPAD(NEXTVAL('payment_seq')::TEXT, 4, '0'));
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            `;

            // Trigger to auto-generate paymentid
            const createTriggerGeneratePrimaryIdQuery = `
                CREATE TRIGGER trigger_generate_payment_id
                BEFORE INSERT ON payments
                FOR EACH ROW
                EXECUTE FUNCTION generate_payment_id();
            `;

            // Function to update 'updated_at' column automatically
            const createFunctionUpdateTimestampQuery = `
                CREATE OR REPLACE FUNCTION update_payment_timestamp()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at = CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            `;

            // Trigger to update 'updated_at' column before update
            const createTriggerUpdateTimestampQuery = `
                CREATE TRIGGER trigger_update_payment_timestamp
                BEFORE UPDATE ON payments
                FOR EACH ROW
                EXECUTE FUNCTION update_payment_timestamp();
            `;

            // Execute all queries
            await db.execute(createTableQuery); // Create payments table
            await db.execute(createSequenceQuery); // Create sequence for Primary IDs
            await db.execute(createFunctionGeneratePrimaryIdQuery); // Create Primary ID generation function
            await db.execute(createTriggerGeneratePrimaryIdQuery); // Create trigger for Primary ID generation
            await db.execute(createFunctionUpdateTimestampQuery); // Create timestamp update function
            await db.execute(createTriggerUpdateTimestampQuery); // Create trigger for updated_at column

            console.log("payments schema created successfully.");
        } else {
            console.log("payments table already exists. Skipping creation.");
        }
    } catch (error) {
        console.error("Error creating payments schema:", error);
    }
};
