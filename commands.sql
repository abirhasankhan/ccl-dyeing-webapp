
-- /* ---Triggers for Updating Quantities--- */

-- Function to Update total_received_qty on Shipment Insert
CREATE OR REPLACE FUNCTION update_order_received_qty() 
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Orders
    SET total_received_qty = COALESCE(total_received_qty, 0) + NEW.quantity_shipped
    WHERE orderid = NEW.orderid;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Trigger to Execute update_order_received_qty on Shipment Insert
CREATE TRIGGER update_order_received_qty_trigger
AFTER INSERT ON Shipments
FOR EACH ROW
EXECUTE FUNCTION update_order_received_qty();



