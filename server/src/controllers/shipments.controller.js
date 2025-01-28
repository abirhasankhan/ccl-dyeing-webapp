import { db } from "../config/drizzleSetup.js";
import { shipments } from "../models/shipments.model.js";
import { eq, desc } from 'drizzle-orm';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { dealOrders } from "../models/dealOrders.model.js";


// Create a new record
const createShipment = asyncHandler(async (req, res) => {

    // Check if request body is missing
    if (!req.body) {
        throw new ApiError(400, "Request body is missing");
    }

    const { orderid, shipment_date, quantity_shipped, notes, remarks } = req.body;

    // Required field validation
    const requiredFields = ['orderid', 'shipment_date', 'quantity_shipped'];
    const missingFields = requiredFields.filter(field =>
        typeof req.body[field] !== "string" || !req.body[field].trim()
    );

    if (missingFields.length > 0) {
        throw new ApiError(400, `Missing required fields: ${missingFields.join(', ')}`);
    }

    // Normalize inputs by trimming strings where applicable
    const normalizedOrderid = orderid.trim();
    const normalizedQuantityShipped = Number(quantity_shipped) || 0;
    const normalizedNotes = notes?.trim() || null;
    const normalizedRemarks = remarks?.trim() || null;
    

    // Validate numeric values
    if (isNaN(normalizedQuantityShipped)) {
        throw new ApiError(400, "Invalid numeric values provided for Quantity Shipped");
    }

    // Check if the Deal Order already exists
    const existingDealOrder = await db.select().from(dealOrders).where(eq(dealOrders.orderid, normalizedOrderid));
    

    if (!existingDealOrder.length) {
        throw new ApiError(400, `Deal Order with orderid ${normalizedOrderid} not exists`);
    }

    const newShimpment = {
        orderid: normalizedOrderid,
        shipment_date: shipment_date,
        quantity_shipped: normalizedQuantityShipped,
        notes: normalizedNotes,
        remarks: normalizedRemarks,
    };    
    
    // Insert into database
    const result = await db.insert(shipments).values(newShimpment).returning();

    if (!result.length) {
        throw new ApiError(500, "Failed to create shipment order");
    }

    return res.status(201).json(
        new ApiResponse(201, result[0],"Shipment order created successfully")
    )
});


// Featch all records
const getAllShipments = asyncHandler(async (req, res) => {
    const result = await db
        .select({
            shipmentid: shipments.shipmentid,
            orderid: shipments.orderid,
            shipment_date: shipments.shipment_date,
            quantity_shipped: shipments.quantity_shipped,
            notes: shipments.notes,
            created_at: shipments.created_at,
            updated_at: shipments.updated_at,
            remarks: shipments.remarks
        })
        .from(shipments)
        .orderBy(desc(shipments.shipmentid));
        
    const formattedResult = result.map(item => ({
        ...item,
        created_at: new Date(item.created_at).toLocaleString(),
        updated_at: new Date(item.updated_at).toLocaleString()
    }));

    return res.status(200).json(
        new ApiResponse(200, formattedResult, "Shipments fetched successfully")
    );
});


// Update an existing record
const updateShipment = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const { orderid, shipment_date, quantity_shipped, notes, remarks } = req.body;

    // Required field validation
    const requiredFields = ['orderid', 'shipment_date', 'quantity_shipped'];
    const missingFields = requiredFields.filter(field =>
        typeof req.body[field] !== "string" || !req.body[field].trim()
    );

    if (missingFields.length > 0) {
        throw new ApiError(400, `Missing required fields: ${missingFields.join(', ')}`);
    }

    // Normalize inputs by trimming strings where applicable
    const normalizedOrderid = orderid.trim();
    const normalizedQuantityShipped = Number(quantity_shipped) || 0;
    const normalizedNotes = notes?.trim() || null;
    const normalizedRemarks = remarks?.trim() || null;

    // Validate numeric values
    if (isNaN(normalizedQuantityShipped)) {
        throw new ApiError(400, "Invalid numeric values provided for Quantity Shipped");
    }

    // Check if the Deal Order already exists
    const existingDealOrder = await db.select().from(dealOrders).where(eq(dealOrders.orderid, normalizedOrderid));

    if (!existingDealOrder.length) {
        throw new ApiError(400, `Deal Order with orderid ${normalizedOrderid} not exists`);
    }

    const updatedShipment = {
        orderid: normalizedOrderid,
        shipment_date: shipment_date,
        quantity_shipped: normalizedQuantityShipped,
        notes: normalizedNotes,
        remarks: normalizedRemarks,
    };

    const result = await db
        .update(shipments)
        .set(updatedShipment)
        .where(eq(shipments.shipmentid, id))
        .returning();


    if (!result.length) {
        throw new ApiError(500, "Failed to update shipment order");
    }

    return res.status(200).json(
        new ApiResponse(200, result[0], "Shipment order updated successfully")
    );
});


// Delete a record
const deleteShipment = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const deletedShipment = await db.delete(shipments).where(eq(shipments.shipmentid, id)).returning(); // returning() returns the deleted row, not rows affected

    // Check if anything was deleted
    if (!deletedShipment.length) {
        throw new ApiError(404, "Shipment not found");
    }

    return res.status(200).json(
        new ApiResponse(200, deletedShipment, "Shipment deleted successfully")
    )
});


export {
    createShipment,
    getAllShipments,
    updateShipment,
    deleteShipment
}