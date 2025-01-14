import { db } from "../config/drizzleSetup.js";
import { AdditionalProcessPrices } from "../models/additionalProcessPrices.model.js";
import { eq } from 'drizzle-orm';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";


// Create a new record
const createAdditionalProcessPrice = asyncHandler(async (req, res) => {

    const { process_type, price_tk, remarks } = req.body;


    if (!process_type || !price_tk) {

        throw new ApiError(400, "All fields are required");
    }

    // Normalize inputs by trimming strings
    const normalizedProcess_type = process_type.trim();
    const normalizedPrice_tk = price_tk.trim();
    const normalizedRemarks = remarks?.trim() || null;

    const newPrice = {
        process_type: normalizedProcess_type,
        price_tk: normalizedPrice_tk,
        remarks: normalizedRemarks,
    }


    const result = await db.insert(AdditionalProcessPrices).values(newPrice).returning();

    return res.status(201).json(
        new ApiResponse(
            201,
            result[0],
            "Additional Process Price created successfully",

        )
    );  

});


// Get all Additional Process Prices
const getAllAdditionalProcessPrices = asyncHandler(async (req, res, next) => {
    const prices = await db.select().from(AdditionalProcessPrices).orderBy(AdditionalProcessPrices.ap_priceid);
    return res.status(200).json(
        new ApiResponse(200, prices, "Fetched Additional Process Prices successfully")
    );
});


// Update an existing Additional Process Price
const updateAdditionalProcessPrice = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { process_type, price_tk, remarks } = req.body;

    if (!process_type || !price_tk) {

        throw new ApiError(400, "All fields are required");
    }

    // Check if the AdditionalProcessPrice exists
    const existingPrice = await db
        .select()
        .from(AdditionalProcessPrices)
        .where(eq(AdditionalProcessPrices.ap_priceid, id));

    if (existingPrice.length === 0) {
        throw new ApiError(404, "Additional Process Price not found");
    }

    // Normalize inputs by trimming strings
    const normalizedProcess_type = process_type?.trim();
    const normalizedPrice_tk = price_tk?.trim();
    const normalizedRemarks = remarks?.trim() || null;

    const updatedPrice = {
        process_type: normalizedProcess_type,
        price_tk: normalizedPrice_tk,
        remarks: normalizedRemarks,
    };

    const result = await db
        .update(AdditionalProcessPrices)
        .set(updatedPrice)
        .where(eq(AdditionalProcessPrices.ap_priceid, id))
        .returning();

    res.status(200).json(
        new ApiResponse(200, result[0], "Additional Process Price updated successfully")
    );
});


// Delete an existing Additional Process Price
const deleteAdditionalProcessPrice = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const deletedPrice = await db
        .delete(AdditionalProcessPrices)
        .where(eq(AdditionalProcessPrices.ap_priceid, id))
        .returning(); // returning() returns the deleted row, not rows affected

    // Check if anything was deleted
    if (deletedPrice.length === 0) {
        throw new ApiError(404, "Additional Process Price not found");
    }

    return res.status(200).json(
        new ApiResponse(200, deletedPrice, "Additional Process Price deleted successfully")
    );
});

export {
    createAdditionalProcessPrice,
    getAllAdditionalProcessPrices,
    updateAdditionalProcessPrice,
    deleteAdditionalProcessPrice
}