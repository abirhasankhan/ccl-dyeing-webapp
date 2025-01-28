import { db } from "../config/drizzleSetup.js"; // Import your database connection

// Function to create the triggers and functions
export const triggerSchema = async () => {
    try {
        console.log("Creating triggers and functions...");

        // Function to update total_received_qty on Shipment Insert
        const createUpdateReceivedQtyFunction = `
            CREATE OR REPLACE FUNCTION update_deal_orders_received_qty() 
            RETURNS TRIGGER AS $$
            BEGIN
                UPDATE deal_orders
                SET total_received_qty = COALESCE(total_received_qty, 0) + NEW.quantity_shipped
                WHERE orderid = NEW.orderid;

                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `;

        // Trigger to execute update_deal_orders_received_qty on Shipment Insert
        const createUpdateReceivedQtyTrigger = `
            CREATE TRIGGER update_deal_orders_received_qty_trigger
            AFTER INSERT ON shipments
            FOR EACH ROW
            EXECUTE FUNCTION update_deal_orders_received_qty();
        `;

        // Function to update total_returned_qty on Return Insert
        const createUpdateReturnedQtyFunction = `
            CREATE OR REPLACE FUNCTION update_deal_orders_returned_qty() 
            RETURNS TRIGGER AS $$
            BEGIN
                UPDATE deal_orders
                SET total_returned_qty = COALESCE(total_returned_qty, 0) + NEW.qty_returned
                WHERE orderid = NEW.orderid;

                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `;

        // Trigger to execute update_deal_orders_returned_qty on Return Insert
        const createUpdateReturnedQtyTrigger = `
            CREATE TRIGGER update_deal_orders_returned_qty_trigger
            AFTER INSERT ON returns
            FOR EACH ROW
            EXECUTE FUNCTION update_deal_orders_returned_qty();
        `;

        // Execute all queries
        await db.execute(createUpdateReceivedQtyFunction); // Create the function for received quantity
        await db.execute(createUpdateReceivedQtyTrigger); // Create the trigger for received quantity
        await db.execute(createUpdateReturnedQtyFunction); // Create the function for returned quantity
        await db.execute(createUpdateReturnedQtyTrigger); // Create the trigger for returned quantity

        console.log("Triggers and functions created successfully.");
    } catch (error) {
        console.error("Error creating triggers and functions:", error);
    }
};
