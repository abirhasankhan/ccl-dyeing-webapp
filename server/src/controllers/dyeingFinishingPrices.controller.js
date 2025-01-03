
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
            shade_percent: normalizedShade_percent,
            tube_tk: normalizedTube_tk,
            open_tk: normalizedOpen_tk,
            elasteen_tk: normalizedElasteen_tk,
            double_dyeing_tk: normalizedDouble_dyeing_tk,
            remarks: normalizedRemarks,
        };

        const insertedPrice = await db.insert(DyeingFinishingPrices).values(newPrice).returning();

        res.status(201).json(
            { 
                success: true,
                data: insertedPrice[0],
            }
        );

    } catch (error) {
        res.status(500).json(
            { 
                success: false,
                message: "Failed to create DyeingFinishingPrice", 
                details: error.message 
            }
        );
    }
};


// Get all DyeingFinishingPrices
export const getAllDyeingFinishingPrices = async (req, res) => {

    try {
        const prices = await db.select().from(DyeingFinishingPrices);
        res.status(200).json({
            success: true,
            data: prices,
            
        });
    } catch (error) {
        res.status(500).json(
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

    try {

        // Check if the DyeingFinishingPrice exists
        const existingPrice = await db
            .select()
            .from(DyeingFinishingPrices)
            .where(eq(DyeingFinishingPrices.df_priceid, id));

        if (existingPrice.length === 0) {
            return res.status(404).send({
                success: false,
                message: "DyeingFinishingPrice not found",
            });
        }

        // Normalize inputs by trimming strings
        const normalizedColor = color?.trim();
        const normalizedShade_percent = shade_percent?.trim();
        const normalizedTube_tk = tube_tk?.trim();
        const normalizedOpen_tk = open_tk?.trim();
        const normalizedElasteen_tk = elasteen_tk?.trim();
        const normalizedDouble_dyeing_tk = double_dyeing_tk?.trim() || 55; // Trim or set to 55
        const normalizedRemarks = remarks?.trim() || null; // Trim remarks or set to null

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

        res.status(200).json({ 
            success: true,
            data: result[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update DyeingFinishingPrice",
            details: error.message
        });
    }
};


// Delete a DyeingFinishingPrice
export const deleteDyeingFinishingPrice = async (req, res) => {

    const { id } = req.params;

    try {

        // Check if the DyeingFinishingPrice exists
        const existingPrice = await db
            .select()
            .from(DyeingFinishingPrices)
            .where(eq(DyeingFinishingPrices.df_priceid, id));

        if (existingPrice.length === 0) {
            return res.status(404).send({
                success: false,
                message: "DyeingFinishingPrice not found",
            });
        }

        const deletedPrice = await db.delete(DyeingFinishingPrices)
            .where(eq(DyeingFinishingPrices.df_priceid, id))
            .returning();

        if (deletedPrice.rowsAffected === 0) {
            return res.status(404).json({ 
                success: false,
                message: "DyeingFinishingPrice not found" 
            });
        }

        res.status(200).json({ 
            success: true,
            message: "DyeingFinishingPrice deleted" 
        });
    } catch (error) {
        console.error("Error deleting DyeingFinishingPrice:", error);
        res.status(500).json({ message: "Failed to delete DyeingFinishingPrice", error });
    }
};