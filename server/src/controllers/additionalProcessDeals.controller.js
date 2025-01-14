import { db } from "../config/drizzleSetup.js";
import { additionalProcessDeals } from "../models/additionalProcessDeals.model.js";
import { eq, ilike } from 'drizzle-orm';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";


// create a new Additional Process Deal
const createAdditionalProcessDeals = asyncHandler(async (req, res) => {

    const { deal_id, process_type, total_price, notes, remarks } = req.body;

    // Required field validation
    const requiredFields = ['deal_id', 'process_type', 'total_price'];
    const missingFields = requiredFields.filter(field => !req.body[field]?.trim());
    if (missingFields.length > 0) {
        throw new ApiError(400, `Missing required fields: ${missingFields.join(', ')}`);
    }

    // Normalize inputs by trimming strings where applicable
    const normalizedDeal_id = deal_id?.trim();
    const normalizedProcess_type = process_type?.trim();
    const normalizedTotal_price = total_price?.trim();
    const normalizedNotes = notes?.trim() || null;
    const normalizedRemarks = remarks?.trim() || null;

    // Validate numeric values
    if (isNaN(normalizedTotal_price)) {
        throw new ApiError(400, "Invalid numeric values provided for Total Price");
    }

    const newAdditionalProcessDeals = {
        deal_id: normalizedDeal_id,
        process_type: normalizedProcess_type,
        total_price: normalizedTotal_price,    
        notes: normalizedNotes,
        remarks: normalizedRemarks,
    } 

    // Insert into database
    const result = await db
        .insert(additionalProcessDeals)
        .values(newAdditionalProcessDeals)
        .returning();

    if (result.length === 0) {
        throw new ApiError(500, "Failed to create Additional Process Deal");
    }

    return res.status(201).json(
        new ApiResponse(201, result, "Additional Process Deal created successfully")
    );
})

// Get all Additional Process Deals
const getAllAdditionalProcessDeals = asyncHandler(async (req, res) => {
    
    const additionalProcessDeals = await db.select().from(additionalProcessDeals);
    return res.status(200).json(
        new ApiResponse(200, additionalProcessDeals, "Additional Process Deals fetched successfully")
    );
})


// Update an existing Additional Process Deal
const updateAdditionalProcessDeals = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { deal_id, process_type, total_price, notes, remarks } = req.body;

    // Check if the AdditionalProcessDeal exists
    const existingDeal = await db
        .select()    
        .from(additionalProcessDeals)
        .where(eq(additionalProcessDeals.appid, id));

    if (existingDeal.length === 0) {
        throw new ApiError(404, "Additional Process Deal not found");
    }

    // Normalize inputs by trimming strings where applicable
    const normalizedDeal_id = deal_id?.trim();
    const normalizedProcess_type = process_type?.trim();
    const normalizedTotal_price = total_price?.trim();
    const normalizedNotes = notes?.trim() || null;
    const normalizedRemarks = remarks?.trim() || null;

    // Validate numeric values
    if (isNaN(normalizedTotal_price)) {
        throw new ApiError(400, "Invalid numeric values provided for Total Price");
    }

    const updatedAdditionalProcessDeals = {
        deal_id: normalizedDeal_id,
        process_type: normalizedProcess_type,
        total_price: normalizedTotal_price,    
        notes: normalizedNotes,
        remarks: normalizedRemarks,
    };

    // Update the Additional Process Deal in the database
    const result = await db
        .update(additionalProcessDeals)
        .set(updatedAdditionalProcessDeals)
        .where(eq(additionalProcessDeals.appid, id))
        .returning();

    if (result.length === 0) {
        throw new ApiError(404, "Additional Process Deal not found after update");
    }

    return res.status(200).json(
        new ApiResponse(200, result, "Additional Process Deal updated successfully")
    );
    
})

// Delete an existing Additional Process Deal
const deleteAdditionalProcessDeals = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const deletedAdditionalProcessDeals = await db.delete(additionalProcessDeals).where(eq(additionalProcessDeals.appid, id)).returning(); // returning() returns the deleted row, not rows affected

    // Check if anything was deleted
    if (deletedAdditionalProcessDeals.length === 0) {
        throw new ApiError(404, "Additional Process Deal not found");
    }    

    return res.status(200).json(
        new ApiResponse(200, deletedAdditionalProcessDeals, "Additional Process Deal deleted successfully")
    );
});




export {
    createAdditionalProcessDeals, 
    getAllAdditionalProcessDeals, 
    updateAdditionalProcessDeals,
    deleteAdditionalProcessDeals
}