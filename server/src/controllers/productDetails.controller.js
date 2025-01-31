import { db } from "../config/drizzleSetup.js";
import { productDetails } from "../models/productDetails.model.js";
import { eq, desc } from 'drizzle-orm';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { shipments } from "../models/shipments.model.js";


// Create a new record
const createProductDetail = asyncHandler(async (req, res) => {

    // Check if request body is missing
    if (!req.body) {
        throw new ApiError(400, "Request body is missing");
    }

    const { shipmentid, yarn_count, color, fabric, gsm, machine_dia, finish_dia, rolls_received, grey_received_qty, grey_return_qty, notes, remarks } = req.body;

    // Required field validation
    const requiredFields = ['shipmentid', 'yarn_count', 'color', 'fabric', 'gsm', 'machine_dia', 'finish_dia', 'rolls_received', 'grey_received_qty',];

    const missingFields = requiredFields.filter(
        (field) => {
            const value = req.body[field];
            return (
                (typeof value !== "string" && typeof value !== "number") || // Check both string and number types
                (typeof value === "string" && !value.trim())               // If it's a string, ensure it's not empty
            );
        });

    if (missingFields.length > 0) {
        throw new ApiError(400, `Missing required fields: ${missingFields.join(', ')}`);
    }

    // Normalize inputs by trimming strings where applicable
    const normalizedShipmentid = String(shipmentid).trim();
    const normalizedYarnCount = String(yarn_count).trim();
    const normalizedColor = String(color).trim();
    const normalizedFabric = String(fabric).trim();
    const normalizedGsm = Number(gsm);
    const normalizedMachineDia = Number(machine_dia);
    const normalizedFinishDia = Number(finish_dia);
    const normalizedRollsReceived = Number(rolls_received);
    const normalizedGreyReceivedQty = Number(grey_received_qty);
    const normalizedGreyReturnQty = Number(grey_return_qty);
    const normalizedNotes = notes ? String(notes).trim() : null;
    const normalizedRemarks = remarks ? String(remarks).trim() : null;

    // Validate numeric values
    if (
        isNaN(normalizedGsm) || normalizedGsm < 0 ||
        isNaN(normalizedMachineDia) || normalizedMachineDia < 0 ||
        isNaN(normalizedFinishDia) || normalizedFinishDia < 0 ||
        isNaN(normalizedRollsReceived) || normalizedRollsReceived < 0 ||
        isNaN(normalizedGreyReceivedQty) || normalizedGreyReceivedQty < 0 ||
        isNaN(normalizedGreyReturnQty) || normalizedGreyReturnQty < 0
    ) {
        throw new ApiError(400, "All numeric values must be greater than 0.");
    }


    // Check if the Shipment already exists
    const existingShipment = await db.select().from(shipments).where(eq(shipments.shipmentid, normalizedShipmentid));
    if (!existingShipment.length) {
        throw new ApiError(404, `Shipment with id ${normalizedShipmentid} does not exist`);
    }

    // Create new product detail
    const newProductDetail = {
        shipmentid: normalizedShipmentid,
        yarn_count: normalizedYarnCount,
        color: normalizedColor,
        fabric: normalizedFabric,
        gsm: normalizedGsm,
        machine_dia: normalizedMachineDia,
        finish_dia: normalizedFinishDia,
        rolls_received: normalizedRollsReceived,
        grey_received_qty: normalizedGreyReceivedQty,
        grey_return_qty: normalizedGreyReturnQty,
        notes: normalizedNotes,
        remarks: normalizedRemarks,
    };

    // Insert into database
    const result = await db.insert(productDetails).values(newProductDetail).returning();

    if (!result.length) {
        throw new ApiError(500, "Failed to create Product Details");
    }

    return res.status(201).json(new ApiResponse(201, result[0], "Product Details created successfully"));
});


// Get all product details
const getAllProductDetail = asyncHandler(async (req, res) => {

    // Fetch all product details from the database
    const result = await db
        .select()
        .from(productDetails)
        .orderBy(desc(productDetails.productdetailid));

    // Format the result (convert dates to readable strings)
    const formatDate = (date) => (date ? new Date(date).toLocaleString() : "N/A");

    const formattedResult = result.map((item) => {
        // Handle case where the item might be null or undefined
        if (!item) return {}; // Skip or return an empty object for invalid entries

        return {
            ...item,
            created_at: formatDate(item.created_at),
            updated_at: formatDate(item.updated_at),
        };
    });


    // Return the formatted result
    return res.status(200).json(
        new ApiResponse(200, formattedResult, "Product Details fetched successfully")
    );
});


// Update an existing record
const updateProductDetail = asyncHandler(async (req, res) => {
    

    const { id } = req.params;

    const { shipmentid, yarn_count, color, fabric, gsm, machine_dia, finish_dia, rolls_received, grey_received_qty, grey_return_qty, notes, remarks } = req.body;

    // Required field validation
    const requiredFields = ['shipmentid', 'yarn_count', 'color', 'fabric', 'gsm', 'machine_dia', 'finish_dia', 'rolls_received', 'grey_received_qty'];

    const missingFields = requiredFields.filter(field => {
        const value = req.body[field];
        return (
            (typeof value !== "string" && typeof value !== "number") || // Check both string and number types
            (typeof value === "string" && !value.trim())               // If it's a string, ensure it's not empty
        );
    });


    if (missingFields.length > 0) {
        throw new ApiError(400, `Missing required fields: ${missingFields.join(', ')}`);
    }

    // Normalize inputs by trimming strings where applicable
    const normalizedShipmentid = String(shipmentid).trim();
    const normalizedYarnCount = String(yarn_count).trim();
    const normalizedColor = String(color).trim();
    const normalizedFabric = String(fabric).trim();
    const normalizedGsm = Number(gsm);
    const normalizedMachineDia = Number(machine_dia);
    const normalizedFinishDia = Number(finish_dia);
    const normalizedRollsReceived = Number(rolls_received);
    const normalizedGreyReceivedQty = Number(grey_received_qty);
    const normalizedGreyReturnQty = Number(grey_return_qty);
    const normalizedNotes = notes ? String(notes).trim() : null;
    const normalizedRemarks = remarks ? String(remarks).trim() : null;

    // Validate numeric values
    if (
        isNaN(normalizedGsm) || normalizedGsm < 0 ||
        isNaN(normalizedMachineDia) || normalizedMachineDia < 0 ||
        isNaN(normalizedFinishDia) || normalizedFinishDia < 0 ||
        isNaN(normalizedRollsReceived) || normalizedRollsReceived < 0 ||
        isNaN(normalizedGreyReceivedQty) || normalizedGreyReceivedQty < 0 ||
        isNaN(normalizedGreyReturnQty) || normalizedGreyReturnQty < 0
    ) {
        throw new ApiError(400, "All numeric values must be greater than 0.");
    }

    // Check if the Shipment already exists
    const existingShipment = await db.select().from(shipments).where(eq(shipments.shipmentid, normalizedShipmentid));

    if (!existingShipment.length) {
        throw new ApiError(404, `Shipment with id ${normalizedShipmentid} not exists`);
    }

    const updateProductDetail = {
        shipmentid: normalizedShipmentid,
        yarn_count: normalizedYarnCount,
        color: normalizedColor,
        fabric: normalizedFabric,
        gsm: normalizedGsm,
        machine_dia: normalizedMachineDia,
        finish_dia: normalizedFinishDia,
        rolls_received: normalizedRollsReceived,
        grey_received_qty: normalizedGreyReceivedQty,
        grey_return_qty: normalizedGreyReturnQty,
        notes: normalizedNotes,
        remarks: normalizedRemarks,
    };

    const result = await db
        .update(productDetails)
        .set(updateProductDetail)
        .where(eq(productDetails.productdetailid, id))
        .returning();

    if (!result.length) {
        throw new ApiError(500, "Failed to update Product Details");
    }

    return res.status(200).json(
        new ApiResponse(200, result[0], "Product Details updated successfully")
    );
});


// Delete a record
const deleteProductDetail = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const deletedProductDetail = await db.delete(productDetails).where(eq(productDetails.productdetailid, id)).returning(); // returning() returns the deleted row, not rows affected

    // Check if anything was deleted
    if (!deletedProductDetail.length) {
        throw new ApiError(404, "Product Details not found");
    }

    return res.status(200).json(
        new ApiResponse(200, deletedProductDetail, "Product Details deleted successfully")
    )
});


export {
    createProductDetail,
    getAllProductDetail,
    updateProductDetail,
    deleteProductDetail
}