import { db } from "../config/drizzleSetup.js"; // Import the Drizzle instance


export const shipmentsSchema = async () => {
    try {
        console.log("Checking if the shipments table exists...");

        // Check if the 'Clients' table exists by querying the information_schema
        const result = await db.execute(`
            SELECT to_regclass('public."shipments"');
        `);

        // If the result is null, the table does not exist
        if (result.rows[0].to_regclass === null) {

            console.log("shipments table does not exist. Creating it...");

            // Raw SQL query to create the Clients table with unique constraints
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS shipments (
                    shipmentid VARCHAR(255) PRIMARY KEY,
                    orderid VARCHAR(255) NOT NULL,
                    shipment_date DATE NOT NULL,
                    quantity_shipped INT NOT NULL,
                    notes TEXT,
                    remarks TEXT,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (orderid) REFERENCES deal_orders(orderid) ON DELETE CASCADE
                );
            `;

            // Sequence for generating ShipmentID
            const createSequenceQuery = `
                CREATE SEQUENCE shipments_seq START 1;
            `;

            // Function to generate ShipmentID before insert
            const createFunctionGeneratePrimaryIdQuery = `
                CREATE OR REPLACE FUNCTION generate_shipment_id() RETURNS TRIGGER AS $$
                BEGIN
                    NEW.shipmentid := CONCAT('SHIP-', LPAD(NEXTVAL('shipments_seq')::TEXT, 6, '0'));
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            `;

            // Trigger to auto-generate ShipmentID
            const createTriggerGeneratePrimaryIdQuery = `
                CREATE TRIGGER trigger_generate_shipment_id
                BEFORE INSERT ON Shipments
                FOR EACH ROW
                EXECUTE FUNCTION generate_shipment_id();
            `;

            // Function to update updated_at timestamp

            const createFunctionUpdateTimestampQuery = `
                CREATE OR REPLACE FUNCTION update_shipment_timestamp()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at := CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            `;

            // Trigger to update updated_at before update
            const createTriggerUpdateTimestampQuery = `
                CREATE TRIGGER trigger_update_shipment_timestamp
                BEFORE UPDATE ON Shipments
                FOR EACH ROW
                EXECUTE FUNCTION update_shipment_timestamp();
            `;

            // Execute all queries
            await db.execute(createTableQuery); // Create Clients table
            await db.execute(createSequenceQuery); // Create sequence for Primary IDs
            await db.execute(createFunctionGeneratePrimaryIdQuery); // Create Primary ID generation function
            await db.execute(createTriggerGeneratePrimaryIdQuery); // Create trigger for Primary ID generation
            await db.execute(createFunctionUpdateTimestampQuery); // Create timestamp update function
            await db.execute(createTriggerUpdateTimestampQuery); // Create trigger for updated_at column

            console.log("shipments schema created successfully.");
        } else {
            console.log("shipments table already exists. Skipping creation.");
        }
    } catch (error) {
        console.error("Error creating shipments schema:", error);
    }
};
