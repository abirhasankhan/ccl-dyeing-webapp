import { db } from "../config/drizzleSetup.js"; // Import the Drizzle instance


export const productDetailsSchema = async () => {
    try {
        console.log("Checking if the product_details table exists...");

        // Check if the 'Clients' table exists by querying the information_schema
        const result = await db.execute(`
            SELECT to_regclass('public."product_details"');
        `);

        // If the result is null, the table does not exist
        if (result.rows[0].to_regclass === null) {

            console.log("product_details table does not exist. Creating it...");

            // Raw SQL query to create the Clients table with unique constraints
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS product_details (
                    productdetailid VARCHAR(255) PRIMARY KEY,
                    shipmentid VARCHAR(255) NOT NULL,
                    yarn_count VARCHAR(255),
                    color VARCHAR(255),
                    fabric VARCHAR(255),
                    gsm FLOAT,
                    machine_dia FLOAT,
                    finish_dia FLOAT,
                    rolls_received INT,
                    total_qty_company INT,
                    total_grey_received INT,
                    grey_received_qty INT,
                    grey_return_qty INT DEFAULT 0,
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    remarks TEXT,
                    FOREIGN KEY (shipmentid) REFERENCES Shipments(shipmentid) ON DELETE CASCADE,
                    CONSTRAINT chk_qty_non_negative CHECK (
                        total_qty_company >= 0 AND
                        total_grey_received >= 0 AND
                        grey_received_qty >= 0 AND
                        grey_return_qty >= 0 AND
                        rolls_received >= 0
                    )
                );
            `;

            // Sequence for generating ProductDetailID
            const createSequenceQuery = `
                CREATE SEQUENCE product_details_seq START 1;
            `;

            // Function to generate ProductDetailID
            const createFunctionGenerateClientIdQuery = `
                CREATE OR REPLACE FUNCTION generate_product_detail_id() RETURNS TRIGGER AS $$
                BEGIN
                    NEW.productdetailid := CONCAT('PD-', LPAD(NEXTVAL('product_details_seq')::TEXT, 6, '0'));
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            `;

            // Trigger to auto-generate ProductDetailID
            const createTriggerGenerateClientIdQuery = `
                CREATE TRIGGER trigger_generate_product_detail_id
                BEFORE INSERT ON product_details
                FOR EACH ROW
                EXECUTE FUNCTION generate_product_detail_id();
            `;

            // Function to update updated_at timestamp
            const createFunctionUpdateTimestampQuery = `
                CREATE OR REPLACE FUNCTION update_productdetails_timestamp()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at = CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            `;

            // Trigger to update updated_at before update
            const createTriggerUpdateTimestampQuery = `
                CREATE TRIGGER trigger_update_productdetails_timestamp
                BEFORE UPDATE ON product_details
                FOR EACH ROW
                EXECUTE FUNCTION update_productdetails_timestamp();
            `;

            // Execute all queries
            await db.execute(createTableQuery); // Create Clients table
            await db.execute(createSequenceQuery); // Create sequence for client IDs
            await db.execute(createFunctionGenerateClientIdQuery); // Create client ID generation function
            await db.execute(createTriggerGenerateClientIdQuery); // Create trigger for client ID generation
            await db.execute(createFunctionUpdateTimestampQuery); // Create timestamp update function
            await db.execute(createTriggerUpdateTimestampQuery); // Create trigger for updated_at column

            console.log("product_details schema created successfully.");
        } else {
            console.log("product_details table already exists. Skipping creation.");
        }
    } catch (error) {
        console.error("Error creating product_details schema:", error);
    }
};
