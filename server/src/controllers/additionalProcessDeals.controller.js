import { db } from "../config/drizzleSetup.js";
import { additionalProcessDeals } from "../models/additionalProcessDeals.model.js";
import { eq, ilike } from 'drizzle-orm';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";


// create a new Additional Process Deal
const createAdditionalProcessDeals = asyncHandler(async (req, res) => {
    const { deal_id, additionalProcessDeals } = req.body;

    // Required field validation for the overall request
    if (!deal_id || !additionalProcessDeals || !Array.isArray(additionalProcessDeals) || additionalProcessDeals.length === 0) {
        throw new ApiError(400, "Missing or invalid additional process deals data");
    }

    // Iterate through each additional process deal
    for (const deal of additionalProcessDeals) {
        const { process_type, price_tk, notes, remarks } = deal;

        // Validate required fields for each deal
        const requiredFields = ['process_type', 'price_tk'];
        const missingFields = requiredFields.filter(field => !deal[field]);
        if (missingFields.length > 0) {
            throw new ApiError(400, `Missing required fields in deal: ${missingFields.join(', ')}`);
        }

        // Normalize inputs and parse numbers correctly
        const normalizedDeal = {
            deal_id: deal_id.trim(),
            process_type: process_type.trim(),
            price_tk: !isNaN(parseFloat(price_tk)) ? parseFloat(price_tk) : 0,  // Handle numeric values
            notes: notes?.trim() || null,
            remarks: remarks?.trim() || null,
        };

        // Validate numeric fields
        if (isNaN(normalizedDeal.price_tk)) {
            throw new ApiError(400, "Invalid numeric value provided for price_tk");
        }

        // Insert each deal into the database
        const result = await db
            .insert(additionalProcessDeals)
            .values(normalizedDeal)
            .returning();

        if (result.length === 0) {
            throw new ApiError(500, `Failed to create Additional Process Deal for process type: ${normalizedDeal.process_type}`);
        }
    }

    return res.status(201).json(
        new ApiResponse(201, null, "Additional Process Deals created successfully")
    );
});


// Get all Additional Process Deals
const getAllAdditionalProcessDeals = asyncHandler(async (req, res) => {
    
    const result = await db.select().from(additionalProcessDeals).orderBy(additionalProcessDeals.appid);
    return res.status(200).json(
        new ApiResponse(200, result, "Additional Process Deals fetched successfully")
    );
})


// Update an existing Additional Process Deal
const updateAdditionalProcessDeals = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { deal_id, process_type, price_tk, notes, remarks } = req.body;

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
    const normalizedTotal_price = price_tk?.trim();
    const normalizedNotes = notes?.trim() || null;
    const normalizedRemarks = remarks?.trim() || null;

    // Validate numeric values
    if (isNaN(normalizedTotal_price)) {
        throw new ApiError(400, "Invalid numeric values provided for Total Price");
    }

    const updatedAdditionalProcessDeals = {
        deal_id: normalizedDeal_id,
        process_type: normalizedProcess_type,
        price_tk: normalizedTotal_price,    
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