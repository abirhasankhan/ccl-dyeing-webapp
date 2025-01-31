
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








-- /*----------------Dyeing Finish Process------------------------*/

-- Store Table
CREATE TABLE Store (
    storeid VARCHAR(255) PRIMARY KEY DEFAULT NULL,
    completionid VARCHAR(255) NOT NULL, 
    product_location VARCHAR(255) NOT NULL, 
    qty INT NOT NULL,
    status VARCHAR(50) DEFAULT 'In Store',  -- Status: 'In Store' or 'Delivered'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (completionid) REFERENCES DyeingCompletion(completionid) ON DELETE CASCADE
);



-- Sequence for generating storeid
CREATE SEQUENCE store_seq START 1;

-- Function to generate storeid
CREATE OR REPLACE FUNCTION generate_store_id() RETURNS TRIGGER AS $$ 
BEGIN
    NEW.storeid := CONCAT('ST-', LPAD(NEXTVAL('store_seq')::TEXT, 6, '0')); 
    RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

-- Trigger to generate storeid
CREATE TRIGGER trigger_generate_store_id
BEFORE INSERT ON Store
FOR EACH ROW
EXECUTE FUNCTION generate_store_id();

