import { db } from "../config/drizzleSetup.js";
import { store } from "../models/store.model.js";
import { dyeingProcess } from "../models/dyeingProcess.model.js";
import { eq } from "drizzle-orm";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

// Create a new store record
const createStore = asyncHandler(async (req, res) => {

    // Check if request body is missing
    if (!req.body) {
        throw new ApiError(400, "Request body is missing");
    }

    const { processid, product_location, qty, status, notes, remarks } = req.body;

    // Required field validation
    const requiredFields = ["processid", "product_location", "qty"];
    const missingFields = requiredFields.filter((field) => {
        const value = req.body[field];
        return (
            (typeof value !== "string" && typeof value !== "number") || // Check both string and number types
            (typeof value === "string" && !value.trim()) // If it's a string, ensure it's not empty
        );
    });

    if (missingFields.length > 0) {
        throw new ApiError(400, `Missing required fields: ${missingFields.join(", ")}`);
    }

    // Normalize inputs by trimming strings where applicable
    const normalizedProcessId = String(processid).trim();
    const normalizedProductLocation = String(product_location).trim();
    const normalizedQty = Number(qty);
    const normalizedStatus = status ? String(status).trim() : "In Store";
    const normalizedNotes = notes ? String(notes).trim() : null;
    const normalizedRemarks = remarks ? String(remarks).trim() : null;

    // Validate numeric values
    if (isNaN(normalizedQty) || normalizedQty < 0) {
        throw new ApiError(400, "Quantity must be a number greater than or equal to 0.");
    }

    // Check if the referenced dyeing process exists
    const existingProcess = await db
        .select()
        .from(dyeingProcess)
        .where(eq(dyeingProcess.processid, normalizedProcessId));

    if (!existingProcess.length) {
        throw new ApiError(404, `Dyeing Process with id ${normalizedProcessId} does not exist`);
    }

    // Create new store record object
    const newStoreRecord = {
        processid: normalizedProcessId,
        product_location: normalizedProductLocation,
        qty: normalizedQty,
        status: normalizedStatus,
        notes: normalizedNotes,
        remarks: normalizedRemarks,
    };

    // Insert into the store table
    const result = await db
        .insert(store)
        .values(newStoreRecord)
        .returning();

    if (!result.length) {
        throw new ApiError(500, "Failed to create Store record");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, result[0], "Store record created successfully"));
});

// Get all store records
const getAllStore = asyncHandler(async (req, res) => {

    const result = await db
        .select()
        .from(store)
        .orderBy(store.created_at);

    // Format dates
    const formatDate = (date) => (date ? new Date(date).toLocaleString() : "N/A");

    const formattedResult = result.map((item) => ({
        ...item,
        created_at: formatDate(item.created_at),
        updated_at: formatDate(item.updated_at),
    }));

    return res
        .status(200)
        .json(new ApiResponse(200, formattedResult, "Store records fetched successfully"));
});

// Update an existing store record
const updateStore = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const { processid, product_location, qty, status, notes, remarks } = req.body;

    // Required field validation
    const requiredFields = ["processid", "product_location", "qty"];
    const missingFields = requiredFields.filter((field) => {
        const value = req.body[field];
        return (
            (typeof value !== "string" && typeof value !== "number") || // Check both string and number types
            (typeof value === "string" && !value.trim()) // If it's a string, ensure it's not empty
        );
    });

    if (missingFields.length > 0) {
        throw new ApiError(400, `Missing required fields: ${missingFields.join(", ")}`);
    }

    // Normalize inputs by trimming strings where applicable
    const normalizedProcessId = String(processid).trim();
    const normalizedProductLocation = String(product_location).trim();
    const normalizedQty = Number(qty);
    const normalizedStatus = status ? String(status).trim() : "In Store";
    const normalizedNotes = notes ? String(notes).trim() : null;
    const normalizedRemarks = remarks ? String(remarks).trim() : null;

    // Validate numeric values
    if (isNaN(normalizedQty) || normalizedQty < 0) {
        throw new ApiError(400, "Quantity must be a number greater than or equal to 0.");
    }

    // Check if the referenced dyeing process exists
    const existingProcess = await db
        .select()
        .from(dyeingProcess)
        .where(eq(dyeingProcess.processid, normalizedProcessId));

    if (!existingProcess.length) {
        throw new ApiError(404, `Dyeing Process with id ${normalizedProcessId} does not exist`);
    }

    // Fetch the existing store record
    const existingStore = await db
        .select()
        .from(store)
        .where(eq(store.storeid, id));

    if (!existingStore.length) {
        throw new ApiError(404, "Store record not found");
    }

    // Update store record object
    const updateStoreRecord = {
        processid: normalizedProcessId,
        product_location: normalizedProductLocation,
        qty: normalizedQty,
        status: normalizedStatus,
        notes: normalizedNotes,
        remarks: normalizedRemarks,
    };

    // Update the store table
    const result = await db
        .update(store)
        .set(updateStoreRecord)
        .where(eq(store.storeid, id))
        .returning();

    if (!result.length) {
        throw new ApiError(500, "Failed to update Store record");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, result[0], "Store record updated successfully"));
});

// Delete a store record
const deleteStore = asyncHandler(async (req, res) => {
    
    const { id } = req.params;

    // Fetch the store record to ensure it exists
    const existingStore = await db
        .select()
        .from(store)
        .where(eq(store.storeid, id));

    if (!existingStore.length) {
        throw new ApiError(404, "Store record not found");
    }

    // Delete the store record
    const result = await db
        .delete(store)
        .where(eq(store.storeid, id))
        .returning();

    if (!result.length) {
        throw new ApiError(500, "Failed to delete Store record");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, result[0], "Store record deleted successfully"));
});

export { createStore, getAllStore, updateStore, deleteStore };