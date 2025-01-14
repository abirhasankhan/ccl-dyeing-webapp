
import { db } from "../config/drizzleSetup.js";
import { DyeingFinishingPrices } from '../models/dyeingFinishingPrices.model.js'; // Import the table schema
import { eq, ilike, or, ne, and } from 'drizzle-orm';

// Create a new DyeingFinishingPrice
export const createDyeingFinishingPrice = async (req, res) => {

    const { color, shade_percent, tube_tk, open_tk, elasteen_tk, double_dyeing_tk, remarks } = req.body;

    if (!color || !tube_tk || !open_tk || !elasteen_tk) {
        return res.status(400).send(
            {
                message: "All fields are required."

            }
        );
    }


    try {

        // Normalize inputs by trimming strings
        const normalizedColor = color.trim();
        const normalizedShade_percent = shade_percent?.trim();
        const normalizedTube_tk = tube_tk.trim();
        const normalizedOpen_tk = open_tk.trim();
        const normalizedElasteen_tk = elasteen_tk.trim();
        const normalizedDouble_dyeing_tk = double_dyeing_tk?.trim() || 55; // Trim or set to 55
        const normalizedRemarks = remarks?.trim() || null; // Trim remarks or set to null

        const newPrice = {
            color: normalizedColor,
            shade_percent: normalizedShade_percent || null,
            tube_tk: normalizedTube_tk,
            open_tk: normalizedOpen_tk,
            elasteen_tk: normalizedElasteen_tk,
            double_dyeing_tk: normalizedDouble_dyeing_tk || 55,
            remarks: normalizedRemarks || null,
        };

        const insertedPrice = await db.insert(DyeingFinishingPrices).values(newPrice).returning();

        return res.status(201).json(
            { 
                success: true,
                data: insertedPrice[0],
            }
        );

    } catch (error) {
        return res.status(500).json(
            { 
                success: false,
                message: "Failed to create Dyeing Finishing Price", 
                details: error.message 
            }
        );
    }
};


// Get all DyeingFinishingPrices
export const getAllDyeingFinishingPrices = async (req, res) => {

    try {
        const prices = await db
            .select()
            .from(DyeingFinishingPrices)
            .orderBy(DyeingFinishingPrices.df_priceid);

        return res.status(200).json({
            success: true,
            data: prices,
            
        });
    } catch (error) {
        return res.status(500).json(
            {
                success: false,
                message: "Failed to fetch DyeingFinishingPrices", 
                details: error.message,
            });
    }
};


// Update an existing DyeingFinishingPrice
export const updateDyeingFinishingPrice = async (req, res) => {
    
    const { id } = req.params;
    const { color, shade_percent, tube_tk, open_tk, elasteen_tk, double_dyeing_tk, remarks } = req.body;

    if (!color || !tube_tk || !open_tk || !elasteen_tk) {
        return res.status(400).send(
            {
                message: "All fields are required."

            }
        );
    }

    try {

        // Check if the DyeingFinishingPrice exists
        const existingPrice = await db
            .select()
            .from(DyeingFinishingPrices)
            .where(eq(DyeingFinishingPrices.df_priceid, id));

        if (existingPrice.length === 0) {
            return res.status(404).send({
                success: false,
                message: "Dyeing Finishing Price not found",
            });
        }

        // Normalize inputs by trimming strings
        const normalizedColor = color?.trim();
        const normalizedShade_percent = shade_percent?.trim();
        const normalizedTube_tk = tube_tk?.trim();
        const normalizedOpen_tk = open_tk?.trim();
        const normalizedElasteen_tk = elasteen_tk?.trim();
        const normalizedDouble_dyeing_tk = double_dyeing_tk?.trim(); // Trim or set to 55
        const normalizedRemarks = remarks?.trim(); // Trim remarks or set to null

        // Prepare the updatedPrice data
        const updatedPrice = {
            color: normalizedColor,
            shade_percent: normalizedShade_percent,
            tube_tk: normalizedTube_tk,
            open_tk: normalizedOpen_tk,
            elasteen_tk: normalizedElasteen_tk,
            double_dyeing_tk: normalizedDouble_dyeing_tk,
            remarks: normalizedRemarks,
        };

        const result = await db
            .update(DyeingFinishingPrices)
            .set(updatedPrice)
            .where(eq(DyeingFinishingPrices.df_priceid, id))
            .returning();

        if (updatedPrice.rowsAffected === 0) {
            return res.status(404).json(
                { 
                    success: false,
                    message: "DyeingFinishingPrice not found" 
                });
        }

        return res.status(200).json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update Dyeing Finishing Price",
            details: error.message
        });
    }
};


// Delete a DyeingFinishingPrice
export const deleteDyeingFinishingPrice = async (req, res) => {

    const { id } = req.params;

    try {
        
        const deletedPrice = await db.delete(DyeingFinishingPrices)
            .where(eq(DyeingFinishingPrices.df_priceid, id))
            .returning(); // returning() returns the deleted row, not rows affected

        // Check if anything was deleted
        if (deletedPrice.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Dyeing Finishing Price not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "DyeingFinishingPrice deleted",
            data: deletedPrice
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete DyeingFinishingPrice",
            error: error.message
        });    
    }
};