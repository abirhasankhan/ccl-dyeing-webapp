import { db } from "../config/drizzleSetup.js"; // Import the Drizzle instance

export const dyeingFinishingPricesSchema = async () => {
    try {

        // Checking if the dyeing_finishing_prices table exists
        console.log("Checking if the dyeing_finishing_prices table exists...");
        const resultDyeingFinishing = await db.execute(`
            SELECT to_regclass('public."dyeing_finishing_prices"');
        `);

        // If the result is null, the table does not exist
        if (resultDyeingFinishing.rows[0].to_regclass === null) {
            console.log("dyeing_finishing_prices table does not exist. Creating it...");
            const createDyeingFinishingPricesQuery = `
                CREATE TABLE IF NOT EXISTS dyeing_finishing_prices (
                    df_priceid SERIAL PRIMARY KEY,
                    color VARCHAR(50) NOT NULL,
                    shade_percent VARCHAR(50),
                    tube_tk DECIMAL(10, 2) NOT NULL,
                    open_tk DECIMAL(10, 2) NOT NULL,
                    elasteen_tk DECIMAL(10, 2) NOT NULL,
                    double_dyeing_tk DECIMAL(10, 2) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    remarks TEXT
                );
            `;

            await db.execute(createDyeingFinishingPricesQuery);
            console.log("dyeing_finishing_prices schema created successfully.");
        } else {
            console.log("dyeing_finishing_prices table already exists. Skipping creation.");
        }

    } catch (error) {
        console.error("Error creating schemas:", error);
    }
};
