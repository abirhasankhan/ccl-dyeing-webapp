-- Table: DyeingFinishingPrices
CREATE TABLE DyeingFinishingPrices (
    df_priceid SERIAL PRIMARY KEY,
    color VARCHAR(50) NOT NULL,
    shade_percent VARCHAR(50),
    tube_tk DECIMAL(10, 2) NOT NULL,
    open_tk DECIMAL(10, 2) NOT NULL,
    elasteen_tk DECIMAL(10, 2) NOT NULL,
    double_dyeing_tk DECIMAL(10, 2) NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: AdditionalProcessPrices
CREATE TABLE AdditionalProcessPrices (
    ap_priceid SERIAL PRIMARY KEY,
    process_type VARCHAR(255) NOT NULL,
    price_tk DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT
);



-- Table: Clients

CREATE TABLE Clients (
    clientid VARCHAR(50) PRIMARY KEY,
    companyname VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    contact VARCHAR(20) NOT NULL,
    email VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT
);

-- Sequence for generating client IDs
CREATE SEQUENCE clients_seq START 1;

-- Function to generate client ID
CREATE OR REPLACE FUNCTION generate_client_id() RETURNS TRIGGER AS $$ 
BEGIN
    NEW.clientid := CONCAT('CL-', LPAD(NEXTVAL('clients_seq')::TEXT, 4, '0'));
    RETURN NEW;
END; 
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate client ID
CREATE TRIGGER trigger_generate_client_id
BEFORE INSERT ON Clients
FOR EACH ROW
EXECUTE FUNCTION generate_client_id();

-- Function to update updated_at column on record update
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on record update
CREATE TRIGGER trigger_update_timestamp
BEFORE UPDATE ON Clients
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();




-- ClientDeals

-- Create a sequence for generating unique deal IDs
CREATE SEQUENCE deal_id_seq START 1;


-- Create ClientDeals table
CREATE TABLE ClientDeals (
    deal_id VARCHAR(20) PRIMARY KEY,  
    clientid VARCHAR(20) NOT NULL,
    payment_method VARCHAR(10) CHECK (payment_method IN ('Cash', 'Bank', 'Hybrid')) NOT NULL,
    issue_date DATE,
    valid_through DATE,
    representative VARCHAR(100),
    designation VARCHAR(100),
    contact_no VARCHAR(15),
    bank_info JSONB,
    notes TEXT,
    remarks TEXT,   
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clientid) REFERENCES Clients(clientid)
);
-- Create a function to set deal_id before insert
CREATE OR REPLACE FUNCTION generate_deal_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.deal_id := CONCAT('DEAL', LPAD(nextval('deal_id_seq')::TEXT, 6, '0'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for ClientDeals
CREATE TRIGGER set_deal_id
BEFORE INSERT ON ClientDeals
FOR EACH ROW
EXECUTE FUNCTION generate_deal_id();

-- Modify the function to update the updated_at field whenever the record is updated
CREATE OR REPLACE FUNCTION update_deal_timestamp()
RETURNS TRIGGER AS $$ 
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the trigger for updating updated_at
CREATE TRIGGER trigger_update_deal_timestamp
BEFORE UPDATE ON ClientDeals
FOR EACH ROW
EXECUTE FUNCTION update_deal_timestamp();



-- DyeingFinishingSelections

-- Create a sequence for generating unique dfp IDs
CREATE SEQUENCE dfpid_seq START 1;

-- Create DyeingFinishingSelections table
CREATE TABLE DyeingFinishingSelections (
    dfpid VARCHAR(20) PRIMARY KEY,
    deal_id VARCHAR(20) NOT NULL,
    color VARCHAR(50) NOT NULL,
    shade_percent VARCHAR(50),
    service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('tube_tk', 'open_tk', 'elasteen_tk')),
    service_price_tk DECIMAL(10, 2) NOT NULL,
    double_dyeing_tk DECIMAL(10, 2) DEFAULT 0,
    total_price DECIMAL(10, 2) NOT NULL GENERATED ALWAYS AS (service_price_tk + double_dyeing_tk) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    FOREIGN KEY (deal_id) REFERENCES ClientDeals(deal_id)
);

-- Create a function to set dfpid before insert
CREATE OR REPLACE FUNCTION generate_dfpid()
RETURNS TRIGGER AS $$
BEGIN
    NEW.dfpid := CONCAT('DFP', LPAD(nextval('dfpid_seq')::TEXT, 6, '0'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for DyeingFinishingSelections
CREATE TRIGGER set_dfpid
BEFORE INSERT ON DyeingFinishingSelections
FOR EACH ROW
EXECUTE FUNCTION generate_dfpid();

-- Create or replace the function to update updated_at field when the record is updated
CREATE OR REPLACE FUNCTION update_dyeingfinishingselection_timestamp()
RETURNS TRIGGER AS $$ 
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the trigger for updating updated_at
CREATE TRIGGER trigger_update_dyeingfinishingselection_timestamp
BEFORE UPDATE ON DyeingFinishingSelections
FOR EACH ROW
EXECUTE FUNCTION update_dyeingfinishingselection_timestamp();



-- AdditionalProcessSelections

-- Create a sequence for generating unique app IDs
CREATE SEQUENCE appid_seq START 1;

-- Create AdditionalProcessSelections table
CREATE TABLE AdditionalProcessSelections (
    appid VARCHAR(20) PRIMARY KEY,
    deal_id VARCHAR(20) NOT NULL,
    process_type VARCHAR(255),
    total_price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    FOREIGN KEY (deal_id) REFERENCES ClientDeals(deal_id)
);

-- Create a function to set appid before insert
CREATE OR REPLACE FUNCTION generate_appid()
RETURNS TRIGGER AS $$ 
BEGIN
    NEW.appid := CONCAT('APS', LPAD(nextval('appid_seq')::TEXT, 6, '0'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for AdditionalProcessSelections
CREATE TRIGGER set_appid
BEFORE INSERT ON AdditionalProcessSelections
FOR EACH ROW
EXECUTE FUNCTION generate_appid();

-- Create the trigger function to update the updated_at field
CREATE OR REPLACE FUNCTION update_appid_timestamp()
RETURNS TRIGGER AS $$ 
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the trigger for updating updated_at on update
CREATE TRIGGER trigger_update_appid_timestamp
BEFORE UPDATE ON AdditionalProcessSelections
FOR EACH ROW
EXECUTE FUNCTION update_appid_timestamp();




/*------------------Dyeing Start Process-----------------------------------*/


-- Orders Table
CREATE TABLE Orders (
    orderid VARCHAR(255) PRIMARY KEY,
    clientid VARCHAR(255) NOT NULL,
    deal_id VARCHAR(20) NOT NULL,
    order_number VARCHAR(255) UNIQUE NOT NULL,
    booking_qty INT NOT NULL,
    total_received_qty INT DEFAULT 0,
    total_returned_qty INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    FOREIGN KEY (clientid) REFERENCES Clients(clientid) ON DELETE CASCADE,
    FOREIGN KEY (deal_id) REFERENCES ClientDeals(deal_id) ON DELETE CASCADE
);

-- Sequence for generating OrderID
CREATE SEQUENCE orders_seq START 1;

-- Function to generate OrderID
CREATE OR REPLACE FUNCTION generate_order_id() RETURNS TRIGGER AS $$
BEGIN
    NEW.orderid := CONCAT('ORD-', LPAD(NEXTVAL('orders_seq')::TEXT, 6, '0'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate OrderID
CREATE TRIGGER trigger_generate_order_id
BEFORE INSERT ON Orders
FOR EACH ROW
EXECUTE FUNCTION generate_order_id();

-- Update function for updated_at column
CREATE OR REPLACE FUNCTION update_order_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at column
CREATE TRIGGER trigger_update_order_timestamp
BEFORE UPDATE ON Orders
FOR EACH ROW
EXECUTE FUNCTION update_order_timestamp();



-- Shipments Table
CREATE TABLE Shipments (
    shipmentid VARCHAR(255) PRIMARY KEY, 
    orderid VARCHAR(255) NOT NULL,
    shipment_date DATE NOT NULL,
    quantity_shipped INT NOT NULL,
    status VARCHAR(50) DEFAULT 'in transit',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    FOREIGN KEY (orderid) REFERENCES Orders(orderid) ON DELETE CASCADE
);

-- Sequence for generating ShipmentID
CREATE SEQUENCE shipments_seq START 1;

-- Function to generate ShipmentID
CREATE OR REPLACE FUNCTION generate_shipment_id() RETURNS TRIGGER AS $$
BEGIN
    NEW.shipmentid := CONCAT('SHIP-', LPAD(NEXTVAL('shipments_seq')::TEXT, 6, '0'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate ShipmentID
CREATE TRIGGER trigger_generate_shipment_id
BEFORE INSERT ON Shipments
FOR EACH ROW
EXECUTE FUNCTION generate_shipment_id();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_shipment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at before update
CREATE TRIGGER trigger_update_shipment_timestamp
BEFORE UPDATE ON Shipments
FOR EACH ROW
EXECUTE FUNCTION update_shipment_timestamp();



-- ProductDetails Table
CREATE TABLE ProductDetails (
    productdetailid VARCHAR(255) PRIMARY KEY,
    shipmentid VARCHAR(255) NOT NULL,
    yarn_count VARCHAR(255),
    fabric VARCHAR(255),
    gsm FLOAT,
    machine_dia FLOAT,
    finish_dia FLOAT,
    colorid VARCHAR(255),
    total_qty_company INT,
    total_grey_received INT,
    grey_received_qty INT,
    grey_return_qty INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    FOREIGN KEY (shipmentid) REFERENCES Shipments(shipmentid) ON DELETE CASCADE,
    CONSTRAINT chk_qty_non_negative CHECK (
        total_qty_company >= 0 AND 
        total_grey_received >= 0 AND 
        grey_received_qty >= 0 AND 
        grey_return_qty >= 0
    )
);

-- Sequence for generating ProductDetailID
CREATE SEQUENCE product_details_seq START 1;

-- Function to generate ProductDetailID
CREATE OR REPLACE FUNCTION generate_product_detail_id() RETURNS TRIGGER AS $$
BEGIN
    NEW.productdetailid := CONCAT('PD-', LPAD(NEXTVAL('product_details_seq')::TEXT, 6, '0'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate ProductDetailID
CREATE TRIGGER trigger_generate_product_detail_id
BEFORE INSERT ON ProductDetails
FOR EACH ROW
EXECUTE FUNCTION generate_product_detail_id();

-- Index for Foreign Key
CREATE INDEX idx_productdetails_shipmentid ON ProductDetails(shipmentid);

-- Function to auto-update 'updated_at' column
CREATE OR REPLACE FUNCTION update_productdetails_timestamp() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating 'updated_at' column
CREATE TRIGGER trigger_update_productdetails_timestamp
BEFORE UPDATE ON ProductDetails
FOR EACH ROW
EXECUTE FUNCTION update_productdetails_timestamp();



-- Returns Table
CREATE TABLE Returns (
    returnid VARCHAR(255) PRIMARY KEY, 
    orderid VARCHAR(255) NOT NULL, 
    return_date DATE NOT NULL, 
    qty_returned INT NOT NULL CHECK (qty_returned >= 0), 
    reason_for_return TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,	
    FOREIGN KEY (orderid) REFERENCES Orders(orderid) ON DELETE CASCADE
);

-- Sequence for generating return ID
CREATE SEQUENCE returns_seq START 1;

-- Function to generate return ID
CREATE OR REPLACE FUNCTION generate_return_id() RETURNS TRIGGER AS $$
BEGIN
    NEW.returnid := CONCAT('RT-', LPAD(NEXTVAL('returns_seq')::TEXT, 6, '0'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for generating return ID
CREATE TRIGGER trigger_generate_return_id
BEFORE INSERT ON Returns
FOR EACH ROW
EXECUTE FUNCTION generate_return_id();

-- Function to update 'updated_at' column
CREATE OR REPLACE FUNCTION update_returns_timestamp() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update 'updated_at' column
CREATE TRIGGER trigger_update_returns_timestamp
BEFORE UPDATE ON Returns
FOR EACH ROW
EXECUTE FUNCTION update_returns_timestamp();



/* ---Triggers for Updating Quantities--- */

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


-- Function to Update total_returned_qty on Return Insert
CREATE OR REPLACE FUNCTION update_order_returned_qty() 
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Orders
    SET total_returned_qty = COALESCE(total_returned_qty, 0) + NEW.qty_returned
    WHERE orderid = NEW.orderid;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to Execute update_order_returned_qty on Return Insert
CREATE TRIGGER update_order_returned_qty_trigger
AFTER INSERT ON Returns
FOR EACH ROW
EXECUTE FUNCTION update_order_returned_qty();





-- /*----------------Dyeing Ongoing Process------------------------*/


-- Machines Table
CREATE TABLE Machines (
    machineid VARCHAR(255) PRIMARY KEY,
    machine_name VARCHAR(255) NOT NULL UNIQUE,
    capacity INT NOT NULL, 
    status VARCHAR(50) DEFAULT 'Available', -- Status: Available, Busy, Maintenance
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT
);

-- Sequence for generating machine id
CREATE SEQUENCE machines_seq START 1;

-- Function to generate machine id
CREATE OR REPLACE FUNCTION generate_machine_id() RETURNS TRIGGER AS $$
BEGIN
    NEW.machineid := CONCAT('M-', LPAD(NEXTVAL('machines_seq')::TEXT, 3, '0'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate machine id
CREATE TRIGGER trigger_generate_machine_id
BEFORE INSERT ON Machines
FOR EACH ROW
EXECUTE FUNCTION generate_machine_id();



-- DyeingBatches Table
CREATE TABLE DyeingBatches (
    dbatchid VARCHAR(255) PRIMARY KEY,
    productdetailid VARCHAR(255) NOT NULL, 
    machineid VARCHAR(255) NOT NULL, 
    batch_qty INT NOT NULL, 
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    end_time TIMESTAMP, 
    status VARCHAR(50) DEFAULT 'In Progress',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT, 
    FOREIGN KEY (productdetailid) REFERENCES ProductDetails(productdetailid) ON DELETE CASCADE,
    FOREIGN KEY (machineid) REFERENCES Machines(MachineID) ON DELETE CASCADE
);

-- Sequence for generating the dbatchid
CREATE SEQUENCE dyeing_batches_seq START 1;

-- Function to generate dbatchid
CREATE OR REPLACE FUNCTION generate_dbatch_id() RETURNS TRIGGER AS $$ 
BEGIN
    NEW.dbatchid := CONCAT('DBATCH-', LPAD(NEXTVAL('dyeing_batches_seq')::TEXT, 6, '0'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate dbatchid
CREATE TRIGGER trigger_generate_dbatch_id
BEFORE INSERT ON DyeingBatches
FOR EACH ROW
EXECUTE FUNCTION generate_dbatch_id();

-- Function to update the updated_at field
CREATE OR REPLACE FUNCTION update_dyeing_batch_timestamp()
RETURNS TRIGGER AS $$ 
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at field before updating record
CREATE TRIGGER trigger_update_dyeing_batch_timestamp
BEFORE UPDATE ON DyeingBatches
FOR EACH ROW
EXECUTE FUNCTION update_dyeing_batch_timestamp();



-- FinishProduct Table
CREATE TABLE FinishProduct (
    finishproductid VARCHAR(255) PRIMARY KEY, 
    dbatchid VARCHAR(255) NOT NULL,
    color VARCHAR(255),
    final_qty INT NOT NULL,
    rejected_qty INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT, 
    FOREIGN KEY (dbatchid) REFERENCES DyeingBatches(dbatchid) ON DELETE CASCADE
);

-- Sequence for generating finishproductid
CREATE SEQUENCE finish_product_seq START 1;

-- Function to generate finishproductid
CREATE OR REPLACE FUNCTION generate_finish_product_id() RETURNS TRIGGER AS $$ 
BEGIN
    NEW.finishproductid := CONCAT('FP-', LPAD(NEXTVAL('finish_product_seq')::TEXT, 6, '0')); 
    RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate finishproductid
CREATE TRIGGER trigger_generate_finish_product_id
BEFORE INSERT ON FinishProduct
FOR EACH ROW
EXECUTE FUNCTION generate_finish_product_id();

-- Trigger for auto-updating 'updated_at' column
CREATE OR REPLACE FUNCTION update_finish_product_timestamp() 
RETURNS TRIGGER AS $$ 
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP; 
    RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_finish_product_timestamp
BEFORE UPDATE ON FinishProduct
FOR EACH ROW
EXECUTE FUNCTION update_finish_product_timestamp();

-----------------------------------------------------------------


-- Trigger: Update Machine Status Based on DyeingBatches Status
CREATE OR REPLACE FUNCTION update_machine_status() RETURNS TRIGGER AS $$ 
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        IF NEW.status = 'In Progress' THEN
            UPDATE Machines SET Status = 'Busy' WHERE MachineID = NEW.machineid;
        ELSIF NEW.status = 'Finished' THEN
            UPDATE Machines SET Status = 'Available' WHERE MachineID = NEW.machineid;
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE Machines SET Status = 'Available' WHERE MachineID = OLD.machineid;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger to call the function after insert, update, or delete on DyeingBatches
CREATE TRIGGER machine_status_trigger
AFTER INSERT OR UPDATE OR DELETE ON DyeingBatches
FOR EACH ROW EXECUTE FUNCTION update_machine_status();


-- Trigger: Complete Batch
CREATE OR REPLACE FUNCTION complete_batch() RETURNS TRIGGER AS $$ 
BEGIN
    IF NEW.Status = 'Finished' AND OLD.Status = 'In Progress' THEN
        NEW.EndTime = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger to execute before update on DyeingBatches
CREATE TRIGGER complete_batch_trigger
BEFORE UPDATE ON DyeingBatches
FOR EACH ROW EXECUTE FUNCTION complete_batch();




-- /*----------------Dyeing Finish Process------------------------*/

-- DyeingCompletion Table

CREATE TABLE DyeingCompletion (
    completionid VARCHAR(255) PRIMARY KEY DEFAULT NULL,  
    dbatchid VARCHAR(255) NOT NULL, 
    clientid VARCHAR(255) NOT NULL, 
    orderid VARCHAR(255) NOT NULL, 
    color VARCHAR(255) NOT NULL, 
    fabric_type VARCHAR(255) NOT NULL, 
    mechanic_dia FLOAT NOT NULL, 
    finish_dia FLOAT NOT NULL, 
    request_gsm FLOAT NOT NULL, 
    finish_after_gsm FLOAT NOT NULL, 
    grey_weight FLOAT NOT NULL, 
    finish_weight FLOAT NOT NULL, 
    process_loss FLOAT GENERATED ALWAYS AS ((grey_weight - finish_weight) / NULLIF(grey_weight, 0) * 100) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT, 
    FOREIGN KEY (dbatchid) REFERENCES DyeingBatches(dbatchid) ON DELETE CASCADE,
    FOREIGN KEY (clientid) REFERENCES Clients(clientid) ON DELETE CASCADE,
    FOREIGN KEY (orderid) REFERENCES Orders(orderid) ON DELETE CASCADE
);

-- Sequence for generating CompletionID
CREATE SEQUENCE dyeing_completion_seq START 1;

-- Function to generate CompletionID
CREATE OR REPLACE FUNCTION generate_dyeing_completion_id() RETURNS TRIGGER AS $$ 
BEGIN
    NEW.completionid := CONCAT('DC-', LPAD(NEXTVAL('dyeing_completion_seq')::TEXT, 6, '0'));
    RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

-- Trigger to generate CompletionID
CREATE TRIGGER trigger_generate_dyeing_completion_id
BEFORE INSERT ON DyeingCompletion
FOR EACH ROW
EXECUTE FUNCTION generate_dyeing_completion_id();

-- Function to update updated_at on update
CREATE OR REPLACE FUNCTION update_dyeing_completion_timestamp() 
RETURNS TRIGGER AS $$ 
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP; 
    RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on update
CREATE TRIGGER trigger_update_dyeing_completion_timestamp
BEFORE UPDATE ON DyeingCompletion
FOR EACH ROW
EXECUTE FUNCTION update_dyeing_completion_timestamp();



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



-- DyeingFinishingPrices
INSERT INTO DyeingFinishingPrices (color, shade_percent, tube_tk, open_tk, elasteen_tk, double_dyeing_tk)
VALUES
    ('Normal Wash', 'N/A', 45, 55, 75, 50),
    ('RFD/White/Grey', 'N/A', 55, 65, 85, 50),
    ('Light', '00-2%', 115, 125, 145, 50),
    ('Light Dark', '2.01% To 4%', 120, 130, 150, 50),
    ('Extra Dark', '4.01% To Above', 125, 135, 155, 50),
    ('Reactive Black', 'N/A', 150, 160, 180, 50),
    ('Royal Blue', 'N/A', 155, 165, 185, 50),
    ('For viscose(Modal)/Discharge', 'Add Tk 15', 0, 0, 0, 0); 


-- AdditionalProcessPrices
INSERT INTO AdditionalProcessPrices (process_type, price_tk)
VALUES
    ('Driv Stenter', 25),
    ('Open Compacting', 35),
    ('Stenter Compacting', 30),
    ('Brush Stenter', 10),
    ('Peach Finish', 25),
    ('Dryer', 15),
    ('Tube Compacting', 15),
    ('Enzyme, Softener, Silicon, Back Sewing, Oil Remove', 5);


-- Clients
-- Insert dummy data into Clients table
INSERT INTO Clients (companyname, address, contact, email, status, remarks)
VALUES
    ('ABC Textiles', '123 Textile St, Dhaka, Bangladesh', '01712345678', 'abc@example.com', 'active', 'Long-time client.'),
    ('XYZ Fabrics', '456 Fabric Lane, Dhaka, Bangladesh', '01823456789', 'xyz@example.com', 'active', 'New client, potential for bulk orders.'),
    ('Fabrics Unlimited', '789 Fabrics Blvd, Chittagong, Bangladesh', '01934567890', 'fabricsunlimited@example.com', 'inactive', 'Closed account, no further business.'),
    ('Fashion Fabrics Ltd', '1010 Fashion Park, Sylhet, Bangladesh', '01898765432', 'fashionfabrics@example.com', 'active', 'High-end fabrics supplier.'),
    ('Elegant Threads', '2020 Thread Rd, Rajshahi, Bangladesh', '01787654321', 'elegantthreads@example.com', 'active', 'Preferred supplier for premium clients.');


-- ClientDeals
INSERT INTO ClientDeals (clientid, deal_date, created_at, updated_at, remarks)
VALUES
    ('CL-0001', '2024-12-18 10:30:00', '2024-12-18 10:30:00', '2024-12-18 10:30:00', 'Initial deal for client CL-0001'),
    ('CL-0002', '2024-12-17 14:00:00', '2024-12-17 14:00:00', '2024-12-17 14:00:00', 'Special discount applied for client CL-0002'),
    ('CL-0003', '2024-12-15 09:00:00', '2024-12-15 09:00:00', '2024-12-15 09:00:00', 'Regular service deal for client CL-0003'),
    ('CL-0004', '2024-12-14 16:45:00', '2024-12-14 16:45:00', '2024-12-14 16:45:00', 'Urgent deal for client CL-0004'),
    ('CL-0005', '2024-12-13 13:00:00', '2024-12-13 13:00:00', '2024-12-13 13:00:00', 'One-time offer for client CL-0005');


-- DyeingFinishingSelections
INSERT INTO DyeingFinishingSelections (dfpid, deal_id, color, shade_percent, service_type, service_price_tk, double_dyeing_tk, created_at, updated_at, remarks)
VALUES
    ('DFP000001', 'DEAL000001', 'Normal Wash', 'N/A', 'tube_tk', 45.00, 5.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Standard washing for regular fabrics'),
    ('DFP000002', 'DEAL000001', 'RFD/White/Grey', 'N/A', 'open_tk', 55.00, 0.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Basic white fabric treatment'),
    ('DFP000003', 'DEAL000002', 'Light', '00-2%', 'elasteen_tk', 115.00, 10.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Light color treatment for fabrics'),
    ('DFP000004', 'DEAL000003', 'Light Dark', '2.01% To 4%', 'tube_tk', 120.00, 15.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Dark color treatment for fabrics'),
    ('DFP000005', 'DEAL000003', 'Extra Dark', '4.01% To Above', 'open_tk', 125.00, 20.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Extra dark dyeing for fabrics'),
    ('DFP000006', 'DEAL000004', 'Reactive Black', 'N/A', 'elasteen_tk', 150.00, 30.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Black reactive dye treatment'),
    ('DFP000007', 'DEAL000005', 'Royal Blue', 'N/A', 'tube_tk', 155.00, 25.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Royal blue dyeing treatment');


-- AdditionalProcessSelections
INSERT INTO AdditionalProcessSelections (appid, deal_id, process_type, total_price, created_at, updated_at, remarks)
VALUES
    ('APS000001', 'DEAL000001', 'Bleaching', 1000.00, '2024-12-18 10:00:00', '2024-12-18 10:00:00', 'Standard bleaching process'),
    ('APS000002', 'DEAL000002', 'Washing', 500.00, '2024-12-18 11:00:00', '2024-12-18 11:00:00', 'Cold wash with extra rinse'),
    ('APS000003', 'DEAL000003', 'Drying', 200.00, '2024-12-18 12:00:00', '2024-12-18 12:00:00', 'Air drying at medium temperature'),
    ('APS000004', 'DEAL000004', 'Staining', 1500.00, '2024-12-18 13:00:00', '2024-12-18 13:00:00', 'Staining with vibrant color'),
    ('APS000005', 'DEAL000005', 'Finishing', 800.00, '2024-12-18 14:00:00', '2024-12-18 14:00:00', 'Final finishing after dyeing');


-- Orders
INSERT INTO Orders (clientid, deal_id, order_number, booking_qty, total_received_qty, total_returned_qty, status, remarks)
VALUES
    ('CL-0001', 'DEAL000001', 'ORD-1001', 500, 450, 50, 'completed', 'All items received and processed.'),
    ('CL-0002', 'DEAL000002', 'ORD-1002', 300, 300, 0, 'completed', 'Delivered successfully with no returns.'),
    ('CL-0003', 'DEAL000003', 'ORD-1003', 600, 580, 20, 'processing', 'Order is in progress. Awaiting final batch.'),
    ('CL-0004', 'DEAL000004', 'ORD-1004', 200, 180, 20, 'pending', 'Order is pending approval from the client.'),
    ('CL-0005', 'DEAL000005', 'ORD-1005', 1000, 980, 20, 'completed', 'Bulk order completed and delivered successfully.');


-- Shipments
INSERT INTO Shipments (orderid, shipment_date, quantity_shipped, status, remarks)
VALUES 
    ('ORD-000001', '2024-12-01', 100, 'delivered', 'First batch delivered.'),
    ('ORD-000002', '2024-12-05', 200, 'in transit', 'Shipment on the way.'),
    ('ORD-000003', '2024-12-10', 150, 'pending', 'Awaiting dispatch.');


-- ProductDetails
INSERT INTO ProductDetails (
    shipmentid, yarn_count, fabric, gsm, machine_dia, finish_dia, 
    colorid, total_qty_company, total_grey_received, grey_received_qty, remarks
)
VALUES
    ('SHIP-000001', '40s', 'Cotton', 120.5, 24.0, 22.5, 
     'C-001', 1000, 950, 900, 'Initial entry'),
    ('SHIP-000002', '30s', 'Polyester', 150.0, 26.0, 25.0, 
     'C-002', 1200, 1150, 1120, 'Test batch'),
    ('SHIP-000003', '20s', 'Nylon', 100, 160, 180, 
     'C-003', 2000, 1600, 1400, 'Third product batch');

-- Returns
INSERT INTO Returns (
    orderid, return_date, qty_returned, reason_for_return, remarks
)
VALUES
    ('ORD-000001', '2024-12-01', 50, 'Damaged items', 'First return'),
    ('ORD-000002', '2024-12-05', 30, 'Incorrect shipment', 'Second return');

UPDATE Returns
SET qty_returned = 60, remarks = 'Adjusted quantity'
WHERE returnid = 'RT-000001';




-- Insert a Shipment
INSERT INTO Shipments (
    shipmentid, orderid, shipment_date, quantity_shipped, remarks
)
VALUES
    ('SHIP-000001', 'ORD-000001', '2024-12-10', 100, 'First shipment');

-- -- Insert a Returns
INSERT INTO Returns (
    returnid, orderid, return_date, qty_returned, reason_for_return, remarks
)
VALUES
    ('RT-000001', 'ORD-000001', '2024-12-15', 20, 'Damaged goods', 'First return');




-- Insert Machines
INSERT INTO Machines (machine_name, capacity, status, remarks)
VALUES 
    ('Machine A', 100, 'Available', 'New machine, fully functional'),
    ('Machine B', 150, 'Busy', 'Currently in operation'),
    ('Machine C', 120, 'Maintenance', 'Undergoing scheduled maintenance'),
    ('Machine D', 200, 'Available', 'Spare machine, ready for use'),
    ('Machine E', 180, 'Available', 'Recently repaired and tested');


-- Insert DyeingBatches
INSERT INTO DyeingBatches (dbatchid, productdetailid, machineid, batch_qty, start_time, end_time, status, created_at, updated_at, remarks)
VALUES 
    ('DBATCH-000001', 'PD-000001', 'M-001', 100, '2024-12-01 08:00:00', '2024-12-01 12:00:00', 'Completed', '2024-12-01 08:00:00', '2024-12-01 12:00:00', 'First batch processed successfully'),
    ('DBATCH-000002', 'PD-000002', 'M-002', 200, '2024-12-02 09:00:00', '2024-12-02 13:30:00', 'Completed', '2024-12-02 09:00:00', '2024-12-02 13:30:00', 'Second batch processed successfully'),
    ('DBATCH-000003', 'PD-000003', 'M-003', 150, '2024-12-03 10:00:00', '2024-12-03 14:00:00', 'In Progress', '2024-12-03 10:00:00', '2024-12-03 12:00:00', 'Batch in progress');

-- Insert FinishProduct
INSERT INTO FinishProduct (finishproductid, dbatchid, color, final_qty, rejected_qty, created_at, updated_at, remarks) 
VALUES
    ('FP-000001', 'DBATCH-000001', 'red', 500, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'First batch of dyeing'),
    ('FP-000002', 'DBATCH-000002', 'blue', 400, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Second batch of dyeing'),
    ('FP-000003', 'DBATCH-000003', 'black', 350, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Third batch of dyeing');




-- Insert DyeingCompletion
INSERT INTO DyeingCompletion (dbatchid, clientid, orderid, color, fabric_type, mechanic_dia, finish_dia, request_gsm, finish_after_gsm, grey_weight, finish_weight, remarks)
VALUES
('DBATCH-000001', 'CL-0001', 'ORD-000001', 'Red', 'Cotton', 1.5, 1.4, 150, 148, 100, 95, 'Completed batch, good quality fabric.'),
('DBATCH-000002', 'CL-0002', 'ORD-000002', 'Blue', 'Polyester', 1.8, 1.7, 160, 158, 120, 110, 'Batch processed with slight delay in finishing.'),
('DBATCH-000003', 'CL-0003', 'ORD-000003', 'Green', 'Silk', 2.0, 1.9, 180, 178, 110, 105, 'Quality exceeded expectations, slight weight loss during finishing.');


-- Insert  Store
INSERT INTO Store (completionid, product_location, qty, status, created_at, updated_at) 
VALUES 
('DC-000001', 'Warehouse A', 1000, 'In Store', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('DC-000002', 'Warehouse B', 1500, 'In Store', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('DC-000003', 'Warehouse C', 1200, 'Delivered', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);













-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_store_timestamp() RETURNS TRIGGER AS $$ 
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP; 
    RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at before update on Store table
CREATE TRIGGER trigger_update_store_timestamp
BEFORE UPDATE ON Store
FOR EACH ROW
EXECUTE FUNCTION update_store_timestamp();


select * from DyeingFinishingPrices;

select * from AdditionalProcessPrices;

select * from Clients;

select * from ClientDeals;


select * from DyeingFinishingSelections;

select * from AdditionalProcessSelections;

select * from Orders;

select * from Shipments;

select * from ProductDetails;

select * from Returns;

select * from Machines;

select * from DyeingBatches;

select * from FinishProduct;

select * from DyeingCompletion;

select * from Store;


select * from DyeingFinishingPrices;


