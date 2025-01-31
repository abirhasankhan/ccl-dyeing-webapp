import { db } from "../config/drizzleSetup.js";
import { dyeingProcess } from "../models/dyeingProcess.model.js";
import { eq, desc } from 'drizzle-orm';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { productDetails } from "../models/productDetails.model.js";
import { machines } from "../models/machines.model.js";

// Helper function to update machine status
const updateMachineStatus = async (db, machineId, status) => {
    const result = await db
        .update(machines)
        .set({ status })
        .where(eq(machines.machineid, machineId))
        .returning();

    if (!result.length) {
        throw new ApiError(500, `Failed to update machine status for machine ID ${machineId}`);
    }
};

// Helper function to check if the machine is busy or under maintenance
const isMachineUnavailable = async (db, machineId) => {
    const machine = await db
        .select()
        .from(machines)
        .where(eq(machines.machineid, machineId));

    if (!machine.length) {
        throw new ApiError(404, `Machine with id ${machineId} does not exist`);
    }

    return machine[0].status === "Busy" || machine[0].status === "Under Maintenance";
};


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
        isNaN(normalizedBatchQty) || normalizedBatchQty < 0 ||
        isNaN(normalizedGreyWeight) || normalizedGreyWeight < 0 ||
        isNaN(normalizedFinishWeight) || normalizedFinishWeight < 0 ||
        isNaN(normalizedFinishAfterGsm) || normalizedFinishAfterGsm < 0
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

    // Check if the machine is busy
    const machineBusy = await isMachineUnavailable(db, normalizedMachineId);
    if (machineBusy) {
        throw new ApiError(400, `Machine with id ${normalizedMachineId} is already busy`);
    }

    // Create new dyeing process object
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

    // Start a transaction
    const result = await db.transaction(async (tx) => {
        // Insert into dyeingProcess table
        const newProcess = await tx
            .insert(dyeingProcess)
            .values(newDyeingProcess)
            .returning();

        if (!newProcess.length) {
            throw new ApiError(500, "Failed to create Dyeing Process");
        }

        // Update machine status if the dyeing process is in progress
        if (normalizedStatus === "In Progress") {
            await updateMachineStatus(tx, normalizedMachineId, "Busy");
        }

        return newProcess[0];
    });

    return res.status(201).json(new ApiResponse(201, result, "Dyeing Process created successfully"));
});

// Get all dyeing process records
const getAllDyeingProcess = asyncHandler(async (req, res) => {
    const result = await db
        .select()
        .from(dyeingProcess)
        .orderBy(desc(dyeingProcess.processid));

    // Helper function to format dates
    const formatDate = (date) => (date ? new Date(date).toLocaleString() : "N/A");

    // Format process_loss and dates
    const formattedResult = result.map((item) => {
        if (!item) return {}; // Skip null or undefined entries

        return {
            ...item,
            start_time: formatDate(item.start_time),
            end_time: formatDate(item.end_time),
            created_at: formatDate(item.created_at),
            updated_at: formatDate(item.updated_at),
            process_loss: item.process_loss ? `${parseFloat(item.process_loss).toFixed(2)}%` : "0%", // Format as percentage
        };
    });

    return res.status(200).json(
        new ApiResponse(200, formattedResult, "Dyeing Processes fetched successfully")
    );
});

// Update an existing dyeing process record
const updateDyeingProcess = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const { productdetailid, machineid, batch_qty, grey_weight, finish_weight, finish_after_gsm, status, notes, remarks, final_qty, rejected_qty } = req.body;

    // Required field validation
    const requiredFields = ['productdetailid', 'machineid', 'batch_qty', 'grey_weight', 'finish_weight', 'finish_after_gsm', 'final_qty', 'rejected_qty'];

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
    const normalizedFinalQty = Number(final_qty);
    const normalizedRejectedQty = Number(rejected_qty);
    const normalizedStatus = status ? String(status).trim() : "In Progress";
    const normalizedEndTime = new Date();
    const normalizedNotes = notes ? String(notes).trim() : null;
    const normalizedRemarks = remarks ? String(remarks).trim() : null;

    // Validate numeric values
    if (
        isNaN(normalizedBatchQty) || normalizedBatchQty < 0 ||
        isNaN(normalizedGreyWeight) || normalizedGreyWeight < 0 ||
        isNaN(normalizedFinishWeight) || normalizedFinishWeight < 0 ||
        isNaN(normalizedFinishAfterGsm) || normalizedFinishAfterGsm < 0 ||
        isNaN(normalizedFinalQty) || normalizedFinalQty < 0 ||
        isNaN(normalizedRejectedQty) || normalizedRejectedQty < 0
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

    // Fetch the existing dyeing process to get the current machine ID
    const existingProcess = await db
        .select()
        .from(dyeingProcess)
        .where(eq(dyeingProcess.processid, id));

    if (!existingProcess.length) {
        throw new ApiError(404, "Dyeing Process not found");
    }

    const currentMachineId = existingProcess[0].machineid;

    // Check if the machine is busy (only if the machine ID is being changed)
    if (normalizedMachineId !== currentMachineId) {
        const machineBusy = await isMachineUnavailable(db, normalizedMachineId);
        if (machineBusy) {
            throw new ApiError(400, `Machine with id ${normalizedMachineId} is already busy`);
        }
    }

    // Update dyeing process object
    const updateDyeingProcess = {
        productdetailid: normalizedProductDetailId,
        machineid: normalizedMachineId,
        batch_qty: normalizedBatchQty,
        grey_weight: normalizedGreyWeight,
        finish_weight: normalizedFinishWeight,
        finish_after_gsm: normalizedFinishAfterGsm,
        final_qty: normalizedFinalQty,
        rejected_qty: normalizedRejectedQty,
        end_time: normalizedEndTime,
        status: normalizedStatus,
        notes: normalizedNotes,
        remarks: normalizedRemarks,
    };

    // Start a transaction
    const result = await db.transaction(async (tx) => {
        // Update dyeingProcess table
        const updatedProcess = await tx
            .update(dyeingProcess)
            .set(updateDyeingProcess)
            .where(eq(dyeingProcess.processid, id))
            .returning();

        if (!updatedProcess.length) {
            throw new ApiError(500, "Failed to update Dyeing Process");
        }

        // Update machine status based on the new status
        if (normalizedStatus === "Finished") {
            await updateMachineStatus(tx, normalizedMachineId, "Available");
        } else if (normalizedStatus === "In Progress") {
            await updateMachineStatus(tx, normalizedMachineId, "Busy");
        }

        // If the machine ID was changed, update the old machine's status to available
        if (normalizedMachineId !== currentMachineId) {
            await updateMachineStatus(tx, currentMachineId, "Available");
        }

        return updatedProcess[0];
    });

    return res.status(200).json(
        new ApiResponse(200, result, "Dyeing Process updated successfully")
    );
});

// Delete a dyeing process record
const deleteDyeingProcess = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Start a transaction
    const result = await db.transaction(async (tx) => {
        // Fetch the dyeing process to get the machine ID
        const existingProcess = await tx
            .select()
            .from(dyeingProcess)
            .where(eq(dyeingProcess.processid, id));

        if (!existingProcess.length) {
            throw new ApiError(404, "Dyeing Process not found");
        }

        const machineId = existingProcess[0].machineid;

        // Delete the dyeing process
        const deletedDyeingProcess = await tx
            .delete(dyeingProcess)
            .where(eq(dyeingProcess.processid, id))
            .returning();

        if (!deletedDyeingProcess.length) {
            throw new ApiError(404, "Dyeing Process not found");
        }

        // Update machine status to available
        await updateMachineStatus(tx, machineId, "Available");

        return deletedDyeingProcess[0];
    });

    return res.status(200).json(
        new ApiResponse(200, result, "Dyeing Process deleted successfully")
    );
});

export {
    createDyeingProcess,
    getAllDyeingProcess,
    updateDyeingProcess,
    deleteDyeingProcess
};