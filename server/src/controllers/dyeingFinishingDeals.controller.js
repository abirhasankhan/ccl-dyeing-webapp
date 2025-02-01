import { db } from "../config/drizzleSetup.js";
import { dyeingFinishingDeals } from "../models/dyeingFinishingDeals.model.js";
import { eq, ilike } from 'drizzle-orm';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";


// Create a new Dyeing Finishing Deal
const createDyeingFinishingDeals = asyncHandler(async (req, res) => {
    const { deal_id, dyeingDeals } = req.body;

    // Required field validation for the overall request
    if (!deal_id || !dyeingDeals || !Array.isArray(dyeingDeals) || dyeingDeals.length === 0) {
        throw new ApiError(400, "Missing or invalid dyeing deals data");
    }

    // Iterate through each dyeing deal
    for (const deal of dyeingDeals) {
        const { color, shade_percent, tube_tk, open_tk, elasteen_tk, double_dyeing_tk, notes, remarks } = deal;

        // Validate required fields for each deal
        const requiredFields = ['color', 'tube_tk', 'open_tk', 'elasteen_tk'];
        const missingFields = requiredFields.filter(field => !deal[field]);
        if (missingFields.length > 0) {
            throw new ApiError(400, `Missing required fields in deal: ${missingFields.join(', ')}`);
        }

        // Normalize inputs and parse numbers correctly
        const normalizedDeal = {
            deal_id: deal_id.trim(),
            color: color.trim(),
            shade_percent: typeof shade_percent === 'string' ? shade_percent.trim() : null, // Fix here
            tube_tk: !isNaN(parseFloat(tube_tk)) ? parseFloat(tube_tk) : 0,  // Handle numeric values
            open_tk: !isNaN(parseFloat(open_tk)) ? parseFloat(open_tk) : 0,  // Handle numeric values
            elasteen_tk: !isNaN(parseFloat(elasteen_tk)) ? parseFloat(elasteen_tk) : 0,  // Handle numeric values
            double_dyeing_tk: !isNaN(parseFloat(double_dyeing_tk)) ? parseFloat(double_dyeing_tk) : 55,  // default value for double_dyeing_tk
            notes: notes?.trim() || null,
            remarks: remarks?.trim() || null,
        };

        // Validate numeric fields
        if (isNaN(normalizedDeal.tube_tk) || isNaN(normalizedDeal.open_tk) || isNaN(normalizedDeal.elasteen_tk) || isNaN(normalizedDeal.double_dyeing_tk)) {
            throw new ApiError(400, "Invalid numeric values provided for tube_tk, open_tk, elasteen_tk or double_dyeing_tk");
        }

        // Insert each deal into the database
        const result = await db
            .insert(dyeingFinishingDeals)
            .values(normalizedDeal)
            .returning();

        if (result.length === 0) {
            throw new ApiError(500, `Failed to create Dyeing Finishing Deal for color: ${normalizedDeal.color}`);
        }
    }

    return res.status(201).json(
        new ApiResponse(201, null, "Dyeing Finishing Deals created successfully")
    );
});





// Get all Dyeing Finishing Deals
const getAllDyeingFinishingDeals = asyncHandler(async (req, res) => {

    const result = await db.select().from(dyeingFinishingDeals).orderBy(dyeingFinishingDeals.dfpid);
    

    return res.status(200).json(
        new ApiResponse(200, result, "Dyeing Finishing Deals fetched successfully")    
    );
});

// Update an existing Dyeing Finishing Deal
const updateDyeingFinishingDeals = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { deal_id, color, shade_percent, tube_tk,
        open_tk,
        elasteen_tk, double_dyeing_tk, notes, remarks } = req.body;

    // Check if the Dyeing Finishing Deal exists
    const existingDeal = await db
        .select()
        .from(dyeingFinishingDeals)
        .where(eq(dyeingFinishingDeals.dfpid, id));

    if (existingDeal.length === 0) {
        throw new ApiError(404, "Dyeing Finishing Deal not found");
    }

    // Normalize and validate inputs
    const normalizedDeal_id = deal_id?.trim();
    const normalizedColor = color?.trim();
    const normalizedShade_percent = shade_percent?.trim() || null;
    const normalizedTube_tk = tube_tk?.trim() || 0;
    const normalizedOpen_tk = open_tk?.trim() || 0;
    const normalizedElasteen_tk = elasteen_tk?.trim() || 0;
    const normalizedDouble_dyeing_tk = double_dyeing_tk?.trim() || 55; // Trim or set to 55
    const normalizedNotes = notes?.trim() || null;
    const normalizedRemarks = remarks?.trim() || null;


    const updatedDyeingFinishingDeals = {
        deal_id: normalizedDeal_id,
        color: normalizedColor,
        shade_percent: normalizedShade_percent,
        tube_tk: normalizedTube_tk,
        open_tk: normalizedOpen_tk,
        elasteen_tk: normalizedElasteen_tk,
        double_dyeing_tk: normalizedDouble_dyeing_tk,
        notes: normalizedNotes,
        remarks: normalizedRemarks,
    };

    // Update the record
    const result = await db
        .update(dyeingFinishingDeals)
        .set(updatedDyeingFinishingDeals)
        .where(eq(dyeingFinishingDeals.dfpid, id))
        .returning();

    if (result.length === 0) {
        throw new ApiError(404, "Dyeing Finishing Deal not found after update");
    }

    return res.status(200).json(
        new ApiResponse(200, result, "Dyeing Finishing Deal updated successfully")
    );
});

// Delete a Dyeing Finishing Deal
const deleteDyeingFinishingDeals = asyncHandler(async (req, res) => {

    const { id } = req.params;  

    const deletedDyeingFinishingDeals = await db.delete(dyeingFinishingDeals).where(eq(dyeingFinishingDeals.dfpid, id)).returning(); // returning() returns the deleted row, not rows affected

    // Check if anything was deleted
    if (deletedDyeingFinishingDeals.length === 0) {
        throw new ApiError(404, "Dyeing Finishing Deal not found");
    }

    return res.status(200).json(
        new ApiResponse(200, deletedDyeingFinishingDeals, "Dyeing Finishing Deal deleted successfully")
    )
});



export { 
    createDyeingFinishingDeals, 
    getAllDyeingFinishingDeals, 
    updateDyeingFinishingDeals,
    deleteDyeingFinishingDeals
};

