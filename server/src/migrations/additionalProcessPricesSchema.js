import { db } from "../config/drizzleSetup.js";  

export const additionalProcessPricesSchema = async () => {
    try {
        console.log("Checking if the additional_process_prices table exists.");
        const result = await db.execute(`
            SELECT to_regclass('public."additional_process_prices"');
        `);

        // If the result is null, the table does not exist
        if (result.rows[0].to_regclass === null) {
            console.log("additional_process_prices table does not exist. Creating it...");

            const createAdditionalProcessPricesQuery = `
                CREATE TABLE IF NOT EXISTS "additional_process_prices" (
                    ap_priceid SERIAL PRIMARY KEY,
                    process_type VARCHAR(255) NOT NULL,
                    price_tk DECIMAL(10, 2) NOT NULL,
                    remarks TEXT,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `;

            await db.execute(createAdditionalProcessPricesQuery);

            console.log("additional_process_prices schema created successfully.");
        } else {
            console.log("additional_process_prices table already exists. Skipping creation.");
        }

    } catch (error) {
        console.error("Error running migration:", error);
    }
};
