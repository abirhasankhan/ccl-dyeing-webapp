import { db } from "../config/drizzleSetup.js";
import { dyeingProcess } from "../models/dyeingProcess.model.js";
import { eq, desc } from 'drizzle-orm';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { productDetails } from "../models/productDetails.model.js";
import { machines } from "../models/machines.model.js";

// Create a new dyeing process record
const createDyeingProcess = asyncHandler(async (req, res) => {

    // Check if request body is missing
    if (!req.body) {
        throw new ApiError(400, "Request body is missing");
    }

    const { productdetailid, machineid, batch_qty, grey_weight, finish_weight, finish_after_gsm, status, notes, remarks } = req.body;

    // Required field validation
    const requiredFields = ['productdetailid', 'machineid', 'batch_qty', 'grey_weight', 'finish_weight', 'finish_after_gsm'];

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
    const normalizedProductDetailId = String(productdetailid).trim();
    const normalizedMachineId = String(machineid).trim();
    const normalizedBatchQty = Number(batch_qty);
    const normalizedGreyWeight = Number(grey_weight);
    const normalizedFinishWeight = Number(finish_weight);
    const normalizedFinishAfterGsm = Number(finish_after_gsm);
    const normalizedStatus = status ? String(status).trim() : "In Progress";
    const normalizedNotes = notes ? String(notes).trim() : null;
    const normalizedRemarks = remarks ? String(remarks).trim() : null;

    // Validate numeric values
    if (
        isNaN(normalizedBatchQty) || normalizedBatchQty <= 0 ||
        isNaN(normalizedGreyWeight) || normalizedGreyWeight <= 0 ||
        isNaN(normalizedFinishWeight) || normalizedFinishWeight <= 0 ||
        isNaN(normalizedFinishAfterGsm) || normalizedFinishAfterGsm <= 0
    ) {
        throw new ApiError(400, "All numeric values must be greater than 0.");
    }

    // Check if the Product Detail and Machine exist
    const existingProductDetail = await db.select().from(productDetails).where(eq(productDetails.productdetailid, normalizedProductDetailId));
    if (!existingProductDetail.length) {
        throw new ApiError(404, `Product Detail with id ${normalizedProductDetailId} does not exist`);
    }

    const existingMachine = await db.select().from(machines).where(eq(machines.machineid, normalizedMachineId));
    if (!existingMachine.length) {
        throw new ApiError(404, `Machine with id ${normalizedMachineId} does not exist`);
    }

    // Create new dyeing process
    const newDyeingProcess = {
        productdetailid: normalizedProductDetailId,
        machineid: normalizedMachineId,
        batch_qty: normalizedBatchQty,
        grey_weight: normalizedGreyWeight,
        finish_weight: normalizedFinishWeight,
        finish_after_gsm: normalizedFinishAfterGsm,
        status: normalizedStatus,
        notes: normalizedNotes,
        remarks: normalizedRemarks,
    };

    // Insert into database
    const result = await db.insert(dyeingProcess).values(newDyeingProcess).returning();

    if (!result.length) {
        throw new ApiError(500, "Failed to create Dyeing Process");
    }

    return res.status(201).json(new ApiResponse(201, result[0], "Dyeing Process created successfully"));
});

// Get all dyeing process records
const getAllDyeingProcess = asyncHandler(async (req, res) => {

    const result = await db
        .select()
        .from(dyeingProcess) // Directly select from the table
        .orderBy(desc(dyeingProcess.processid));

    // Format the result (convert dates to readable strings)
    const formatDate = (date) => (date ? new Date(date).toLocaleString() : "N/A");

    const formattedResult = result.map((item) => {
        // Handle case where the item might be null or undefined
        if (!item) return {}; // Skip or return an empty object for invalid entries

        return {
            ...item,
            start_time: formatDate(item.start_time),
            end_time: formatDate(item.end_time),
            created_at: formatDate(item.created_at),
            updated_at: formatDate(item.updated_at),
        };
    });

    // Return the formatted result
    return res.status(200).json(
        new ApiResponse(200, formattedResult, "Dyeing Processes fetched successfully")
    );
});


// Update an existing dyeing process record
const updateDyeingProcess = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const { productdetailid, machineid, batch_qty, grey_weight, finish_weight, finish_after_gsm, status, notes, remarks } = req.body;

    // Required field validation
    const requiredFields = ['productdetailid', 'machineid', 'batch_qty', 'grey_weight', 'finish_weight', 'finish_after_gsm'];

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
    const normalizedProductDetailId = String(productdetailid).trim();
    const normalizedMachineId = String(machineid).trim();
    const normalizedBatchQty = Number(batch_qty);
    const normalizedGreyWeight = Number(grey_weight);
    const normalizedFinishWeight = Number(finish_weight);
    const normalizedFinishAfterGsm = Number(finish_after_gsm);
    const normalizedStatus = status ? String(status).trim() : "In Progress";
    const normalizedNotes = notes ? String(notes).trim() : null;
    const normalizedRemarks = remarks ? String(remarks).trim() : null;

    // Validate numeric values
    if (
        isNaN(normalizedBatchQty) || normalizedBatchQty <= 0 ||
        isNaN(normalizedGreyWeight) || normalizedGreyWeight <= 0 ||
        isNaN(normalizedFinishWeight) || normalizedFinishWeight <= 0 ||
        isNaN(normalizedFinishAfterGsm) || normalizedFinishAfterGsm <= 0
    ) {
        throw new ApiError(400, "All numeric values must be greater than 0.");
    }

    // Check if the Product Detail and Machine exist
    const existingProductDetail = await db.select().from(productDetails).where(eq(productDetails.productdetailid, normalizedProductDetailId));
    if (!existingProductDetail.length) {
        throw new ApiError(404, `Product Detail with id ${normalizedProductDetailId} does not exist`);
    }

    const existingMachine = await db.select().from(machines).where(eq(machines.machineid, normalizedMachineId));
    if (!existingMachine.length) {
        throw new ApiError(404, `Machine with id ${normalizedMachineId} does not exist`);
    }

    // Update dyeing process
    const updateDyeingProcess = {
        productdetailid: normalizedProductDetailId,
        machineid: normalizedMachineId,
        batch_qty: normalizedBatchQty,
        grey_weight: normalizedGreyWeight,
        finish_weight: normalizedFinishWeight,
        finish_after_gsm: normalizedFinishAfterGsm,
        status: normalizedStatus,
        notes: normalizedNotes,
        remarks: normalizedRemarks,
    };

    const result = await db
        .update(dyeingProcess)
        .set(updateDyeingProcess)
        .where(eq(dyeingProcess.processid, id))
        .returning();

    if (!result.length) {
        throw new ApiError(500, "Failed to update Dyeing Process");
    }

    return res.status(200).json(
        new ApiResponse(200, result[0], "Dyeing Process updated successfully")
    );
});

// Delete a dyeing process record
const deleteDyeingProcess = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const deletedDyeingProcess = await db.delete(dyeingProcess).where(eq(dyeingProcess.processid, id)).returning();

    // Check if anything was deleted
    if (!deletedDyeingProcess.length) {
        throw new ApiError(404, "Dyeing Process not found");
    }

    return res.status(200).json(
        new ApiResponse(200, deletedDyeingProcess, "Dyeing Process deleted successfully")
    );
});

export {
    createDyeingProcess,
    getAllDyeingProcess,
    updateDyeingProcess,
    deleteDyeingProcess
};