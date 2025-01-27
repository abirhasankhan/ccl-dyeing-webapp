import { db } from "../config/drizzleSetup.js";
import { productDetails } from "../models/productDetails.model.js";
import { eq, desc } from 'drizzle-orm';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { shipments } from "../models/shipments.model.js";


// Create a new record
const createProductDetail = asyncHandler(async (req, res) => {

    const { shipmentid, yarn_count, color, fabric, gsm, machine_dia, finish_dia, rolls_received, grey_received_qty, grey_return_qty, notes, remarks } = req.body;

    // Required field validation
    const requiredFields = ['shipmentid', 'yarn_count', 'color', 'fabric', 'gsm', 'machine_dia', 'finish_dia', 'rolls_received', 'grey_received_qty', 'grey_return_qty'];

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
    const normalizedShipmentid = shipmentid.trim();
    const normalizedYarnCount = yarn_count.trim();
    const normalizedColor = color.trim();
    const normalizedFabric = fabric.trim();
    const normalizedGsm = Number(gsm);
    const normalizedMachineDia = Number(machine_dia);
    const normalizedFinishDia = Number(finish_dia);
    const normalizedRollsReceived = Number(rolls_received);
    const normalizedGreyReceivedQty = Number(grey_received_qty);
    const normalizedGreyReturnQty = Number(grey_return_qty);
    const normalizedFinalQty = 0;
    const normalizedRejectedQty = 0;
    const normalizedNotes = notes?.trim() || null;
    const normalizedRemarks = remarks?.trim() || null;

    // Validate numeric values
    if (isNaN(normalizedGsm) || isNaN(normalizedMachineDia) || isNaN(normalizedFinishDia) || isNaN(normalizedRollsReceived) || isNaN(normalizedTotalQtyCompany) || isNaN(normalizedTotalGreyReceived) || isNaN(normalizedGreyReceivedQty) || isNaN(normalizedGreyReturnQty)) {
        throw new ApiError(400, "Invalid numeric values provided for GSM, Machine Dia, Finish Dia, Rolls Received, Total Qty Company, Total Grey Received, Grey Received Qty, or Grey Return Qty");
    }

    // Check if the Shipment already exists
    const existingShipment = await db.select().from(shipments).where(eq(shipments.shipmentid, normalizedShipmentid));

    if (!existingShipment.length) {
        throw new ApiError(400, `Shipment with id ${normalizedShipmentid} not exists`);
    }

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
        final_qty: normalizedFinalQty,
        rejected_qty: normalizedRejectedQty,
        notes: normalizedNotes,
        remarks: normalizedRemarks,
    };

    // Insert into database
    const result = await db.insert(productDetails).values(newProductDetail).returning();

    if (!result.length) {
        throw new ApiError(500, "Failed to create Product Details");
    }

    return res.status(201).json(
        new ApiResponse(201, result[0], "Product Details created successfully")
    )

});


// Featch all records
const getAllProductDetail = asyncHandler(async (req, res) => {

    const result = await db
        .select({
            productdetailid: productDetails.productdetailid,
            shipmentid: productDetails.shipmentid,
            yarn_count: productDetails.yarn_count,
            color: productDetails.color,
            fabric: productDetails.fabric,
            gsm: productDetails.gsm,
            machine_dia: productDetails.machine_dia,
            finish_dia: productDetails.finish_dia,
            rolls_received: productDetails.rolls_received,
            total_qty_company: productDetails.total_qty_company,
            total_grey_received: productDetails.total_grey_received,
            grey_received_qty: productDetails.grey_received_qty,
            grey_return_qty: productDetails.grey_return_qty,
            notes: productDetails.notes,
            created_at: productDetails.created_at,
            updated_at: productDetails.updated_at,
            remarks: productDetails.remarks,
        })
        .from(productDetails)
        .orderBy(desc(productDetails.productdetailid)); 

    const formattedResult = result.map(item => ({
        ...item,
        created_at: new Date(item.created_at).toLocaleString(),
        updated_at: new Date(item.updated_at).toLocaleString()
    }));

    return res.status(200).json(
        new ApiResponse(200, formattedResult, " Product Details successfully")
    );

});


// Update an existing record
const updateProductDetail = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const { shipmentid, yarn_count, color, fabric, gsm, machine_dia, finish_dia, rolls_received, grey_received_qty, grey_return_qty, final_qty, rejected_qty, notes, remarks } = req.body;

    // Required field validation
    const requiredFields = ['shipmentid', 'yarn_count', 'color', 'fabric', 'gsm', 'machine_dia', 'finish_dia', 'rolls_received', 'grey_received_qty', 'final_qty', 'rejected_qty'];

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
    const normalizedShipmentid = shipmentid.trim();
    const normalizedYarnCount = yarn_count.trim();
    const normalizedColor = color.trim();
    const normalizedFabric = fabric.trim();
    const normalizedGsm = Number(gsm);
    const normalizedMachineDia = Number(machine_dia);
    const normalizedFinishDia = Number(finish_dia);
    const normalizedRollsReceived = Number(rolls_received);
    const normalizedGreyReceivedQty = Number(grey_received_qty);
    const normalizedGreyReturnQty = Number(grey_return_qty);
    const normalizedFinalQty = Number(final_qty);
    const normalizedRejectedQty = Number(rejected_qty);
    const normalizedNotes = notes?.trim() || null;
    const normalizedRemarks = remarks?.trim() || null;

    // Validate numeric values
    if (isNaN(normalizedGsm) || isNaN(normalizedMachineDia) || isNaN(normalizedFinishDia) || isNaN(normalizedRollsReceived) || isNaN(normalizedGreyReceivedQty) || isNaN(normalizedGreyReturnQty) || isNaN(normalizedFinalQty) || isNaN(normalizedRejectedQty)) {
        throw new ApiError(400, "Invalid numeric values provided for GSM, Machine Dia, Finish Dia, Rolls Received, Grey Received Qty, Grey Return Qty, Final Qty, Rejected Qty");
    }

    // Check if the Shipment already exists
    const existingShipment = await db.select().from(shipments).where(eq(shipments.shipmentid, normalizedShipmentid));

    if (!existingShipment.length) {
        throw new ApiError(400, `Shipment with id ${normalizedShipmentid} not exists`);
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
        final_qty: normalizedFinalQty,
        rejected_qty: normalizedRejectedQty,
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