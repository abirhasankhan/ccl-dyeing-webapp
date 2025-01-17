import { db } from "../config/drizzleSetup.js";
import { dyeingFinishingDeals } from "../models/dyeingFinishingDeals.model.js";
import { eq, ilike } from 'drizzle-orm';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";


// Create a new Dyeing Finishing Deal
const createDyeingFinishingDeals = asyncHandler(async (req, res) => {

    const {
        deal_id,
        color,
        shade_percent,
        service_type,
        service_price_tk,
        double_dyeing_tk,
        notes,
        remarks
    } = req.body;

    // Required field validation
    const requiredFields = ['deal_id', 'color', 'service_type', 'service_price_tk'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
        throw new ApiError(400, `Missing required fields: ${missingFields.join(', ')}`);
    }

    // Normalize inputs and parse numbers correctly
    const normalizedDeal_id = deal_id.trim();
    const normalizedColor = color.trim();
    const normalizedShade_percent = shade_percent?.trim() || null;
    const normalizedService_type = service_type.trim();
    const normalizedService_price_tk = parseFloat(service_price_tk);
    const normalizedDouble_dyeing_tk = parseFloat(double_dyeing_tk) || 0;
    const normalizedNotes = notes?.trim() || null;
    const normalizedRemarks = remarks?.trim() || null;

    // Validate numeric values
    if (isNaN(normalizedService_price_tk) || isNaN(normalizedDouble_dyeing_tk)) {
        throw new ApiError(400, "Invalid numeric values provided for service_price_tk or double_dyeing_tk");
    }

    // Prepare new entry object
    const newDyeingFinishingDeals = {
        deal_id: normalizedDeal_id,
        color: normalizedColor,
        shade_percent: normalizedShade_percent,
        service_type: normalizedService_type,
        service_price_tk: normalizedService_price_tk,
        double_dyeing_tk: normalizedDouble_dyeing_tk,
        total_price: normalizedService_price_tk + normalizedDouble_dyeing_tk,
        notes: normalizedNotes,
        remarks: normalizedRemarks,
    };

    // Insert into database
    const result = await db
        .insert(dyeingFinishingDeals)
        .values(newDyeingFinishingDeals)
        .returning();

    if (result.length === 0) {
        throw new ApiError(500, "Failed to create Dyeing Finishing Deal");
    }

    return res.status(201).json(
        new ApiResponse(201, result, "Dyeing Finishing Deal created successfully")
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
    const { deal_id, color, shade_percent, service_type, service_price_tk, double_dyeing_tk, notes, remarks } = req.body;

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
    const normalizedService_type = service_type?.trim();
    const normalizedService_price_tk = parseFloat(service_price_tk);
    const normalizedDouble_dyeing_tk = parseFloat(double_dyeing_tk) || 0;
    const normalizedNotes = notes?.trim() || null;
    const normalizedRemarks = remarks?.trim() || null;

    // Validate numeric inputs
    if (isNaN(normalizedService_price_tk) || isNaN(normalizedDouble_dyeing_tk)) {
        throw new ApiError(400, "Invalid numeric values provided");
    }

    const updatedDyeingFinishingDeals = {
        deal_id: normalizedDeal_id,
        color: normalizedColor,
        shade_percent: normalizedShade_percent,
        service_type: normalizedService_type,
        service_price_tk: normalizedService_price_tk,
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

