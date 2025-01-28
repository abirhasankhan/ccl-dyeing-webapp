import { db } from "../config/drizzleSetup.js";  

export const returnsSchema = async () => {
    try {
        console.log("Checking if the returns table exists.");
        const result = await db.execute(`
            SELECT to_regclass('public."returns"');
        `);

        if (result.rows[0].to_regclass === null) {
            console.log("returns table does not exist. Creating it...");

            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS "returns" (
                    returnid SERIAL PRIMARY KEY,
                    orderid VARCHAR(255) NOT NULL,
                    return_date DATE NOT NULL,
                    qty_returned INT NOT NULL CHECK (qty_returned >= 0),
                    reason_for_return TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    remarks TEXT,
                    FOREIGN KEY (orderid) REFERENCES deal_orders(orderid) ON DELETE CASCADE
                );
            `;

            const createFunctionUpdateTimestampQuery = `
                CREATE OR REPLACE FUNCTION update_returns_timestamp()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at = CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            `;

            const createTriggerUpdateTimestampQuery = `
                CREATE TRIGGER trigger_update_returns_timestamp
                BEFORE UPDATE ON returns
                FOR EACH ROW
                EXECUTE FUNCTION update_returns_timestamp();
            `;

            await db.execute(createTableQuery); // Create table
            await db.execute(createFunctionUpdateTimestampQuery); // Create function
            await db.execute(createTriggerUpdateTimestampQuery); // Create trigger

            console.log("returns schema created successfully.");
        } else {
            console.log("returns table already exists. Skipping creation.");
        }
    } catch (error) {
        console.error("Error creating returns schema:", error);
    }
};
