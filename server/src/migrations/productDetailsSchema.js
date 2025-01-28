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
                    shipmentid VARCHAR(255) NOT NULL,   -- Links to the shipment
                    yarn_count VARCHAR(255),            -- Yarn count of the raw material
                    color VARCHAR(255),                 -- Color of the product
                    fabric VARCHAR(255),                -- Type of fabric
                    gsm FLOAT,                          -- Fabric weight (grams per square meter)
                    machine_dia FLOAT,                  -- Machine diameter
                    finish_dia FLOAT,                   -- Finished diameter
                    rolls_received INT,                 -- Number of rolls received
                    grey_received_qty INT,              -- Quantity of grey fabric received
                    grey_return_qty INT DEFAULT 0,      -- Grey fabric returned
                    final_qty INT,                      -- Final quantity after dyeing
                    rejected_qty INT DEFAULT 0,         -- Rejected quantity
                    notes TEXT,
                    remarks TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (shipmentid) REFERENCES shipments(shipmentid) ON DELETE CASCADE,
                    CONSTRAINT chk_qty_non_negative CHECK (
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
            const createFunctionGeneratePrimaryIdQuery = `
                CREATE OR REPLACE FUNCTION generate_product_detail_id() RETURNS TRIGGER AS $$
                BEGIN
                    NEW.productdetailid := CONCAT('PD-', LPAD(NEXTVAL('product_details_seq')::TEXT, 6, '0'));
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            `;

            // Trigger to auto-generate ProductDetailID
            const createTriggerGeneratePrimaryIdQuery = `
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
            await db.execute(createSequenceQuery); // Create sequence for Primary IDs
            await db.execute(createFunctionGeneratePrimaryIdQuery); // Create Primary ID generation function
            await db.execute(createTriggerGeneratePrimaryIdQuery); // Create trigger for Primary ID generation
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
