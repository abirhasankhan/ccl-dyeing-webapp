import { db } from "../config/drizzleSetup.js"; // Import the Drizzle instance

// Function to create the Client table manually (if necessary)
export const dealOrdersSchema = async () => {
    try {
        console.log("Checking if the deal_orders table exists...");

        // Check if the 'Clients' table exists by querying the information_schema
        const result = await db.execute(`
            SELECT to_regclass('public."deal_orders"');
        `);

        // If the result is null, the table does not exist
        if (result.rows[0].to_regclass === null) {

            console.log("deal_orders table does not exist. Creating it...");

            // Raw SQL query to create the Clients table with unique constraints
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS deal_orders (
                    orderid VARCHAR(255) PRIMARY KEY,
                    deal_id VARCHAR(255) NOT NULL,
                    challan_no VARCHAR(255) NOT NULL UNIQUE,
                    booking_qty INT NOT NULL,
                    total_received_qty INT DEFAULT 0,
                    total_returned_qty INT DEFAULT 0,
                    status VARCHAR(50) DEFAULT 'Pending',
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    remarks TEXT,
                    CONSTRAINT fk_deal FOREIGN KEY (deal_id) REFERENCES client_deals(deal_id) ON DELETE CASCADE
                );
            `;

            /**
                "Pending",
                "Completed",
                "Canceled",.
            */

            // Sequence for generating deals IDs
            const createSequenceQuery = `
                CREATE SEQUENCE IF NOT EXISTS orders_seq START 1;
            `;

            // Function to set deal_id before insert
            const createFunctionGenerateClientIdQuery = `
                CREATE OR REPLACE FUNCTION generate_order_id()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.orderid := CONCAT('ORD-', LPAD(NEXTVAL('orders_seq')::TEXT, 6, '0'));
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
                `;

            // Create the trigger for ClientDeals
            const createTriggerGenerateClientIdQuery = `
                CREATE TRIGGER trigger_generate_order_id
                BEFORE INSERT ON deal_orders
                FOR EACH ROW
                EXECUTE FUNCTION generate_order_id();
            `;

            // Function to update updated_at column on record update
            const createFunctionUpdateTimestampQuery = `
                CREATE OR REPLACE FUNCTION update_order_timestamp()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at := CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            `;

            // Trigger to update updated_at on record update
            const createTriggerUpdateTimestampQuery = `
                CREATE TRIGGER trigger_update_order_timestamp
                BEFORE UPDATE ON deal_orders
                FOR EACH ROW
                EXECUTE FUNCTION update_order_timestamp();
            `;

            // Execute all queries
            await db.execute(createTableQuery); // Create Clients table
            await db.execute(createSequenceQuery); // Create sequence for client IDs
            await db.execute(createFunctionGenerateClientIdQuery); // Create client ID generation function
            await db.execute(createTriggerGenerateClientIdQuery); // Create trigger for client ID generation
            await db.execute(createFunctionUpdateTimestampQuery); // Create timestamp update function
            await db.execute(createTriggerUpdateTimestampQuery); // Create trigger for updated_at column

            console.log("deal_orders schema created successfully.");
        } else {
            console.log("deal_orders table already exists. Skipping creation.");
        }
    } catch (error) {
        console.error("Error creating deal_orders schema:", error);
    }
};
