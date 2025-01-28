import { db } from "../config/drizzleSetup.js";
import { returns } from "../models/returns.model.js";
import { dealOrders } from "../models/dealOrders.model.js";
import { eq, desc, sql } from 'drizzle-orm';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";


// Create a new return record
const createReturn = asyncHandler(async (req, res) => {

    // Check if request body is missing
    if (!req.body) {
        throw new ApiError(400, "Request body is missing");
    }

    const { orderid, return_date, qty_returned, reason_for_return, remarks } = req.body;

    // Required field validation
    const requiredFields = ['orderid', 'return_date', 'qty_returned'];
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
    const normalizedOrderId = String(orderid).trim();
    const normalizedReturnDate = new Date(return_date).toISOString().split('T')[0]; // Ensure proper date format
    const normalizedQtyReturned = Number(qty_returned);
    const normalizedReasonForReturn = reason_for_return ? String(reason_for_return).trim() : null;
    const normalizedRemarks = remarks ? String(remarks).trim() : null;

    // Validate numeric values
    if (isNaN(normalizedQtyReturned) || normalizedQtyReturned < 0) {
        throw new ApiError(400, "Invalid quantity returned. It must be a non-negative number.");
    }

    // Check if the Order already exists
    const existingOrder = await db.select().from(dealOrders).where(eq(dealOrders.orderid, normalizedOrderId));

    if (!existingOrder.length) {
        throw new ApiError(404, `Order with id ${normalizedOrderId} does not exist`);
    }

    // Create new return record
    const newReturn = {
        orderid: normalizedOrderId,
        return_date: normalizedReturnDate,
        qty_returned: normalizedQtyReturned,
        reason_for_return: normalizedReasonForReturn,
        remarks: normalizedRemarks,
    };

    // Log the input object
    console.log("New Return Record:", newReturn);

    // Insert into database
    const result = await db.transaction(async (tx) => {
        // Insert return record
        const returnResult = await tx.insert(returns).values(newReturn).returning();
        if (!returnResult.length) {
            throw new ApiError(500, "Failed to create Return record");
        }

        // Update total_returned_qty in dealOrders
        const updateResult = await tx
            .update(dealOrders)
            .set({
                total_returned_qty: sql`${dealOrders.total_returned_qty || 0} + ${normalizedQtyReturned}`,
            })
            .where(eq(dealOrders.orderid, normalizedOrderId));

        if (updateResult.rowCount === 0) { // Check affected rows
            throw new ApiError(500, "Failed to update total_returned_qty in dealOrders");
        }

        return returnResult[0]; // Return the newly created return record
    });

    return res.status(201).json(new ApiResponse(201, result, "Return record created successfully"));
});


// Get all return records
const getAllReturns = asyncHandler(async (req, res) => {
    // Fetch all return records from the database
    const result = await db
        .select({
            returnid: returns.returnid,
            orderid: returns.orderid,
            return_date: returns.return_date,
            qty_returned: returns.qty_returned,
            reason_for_return: returns.reason_for_return,
            created_at: returns.created_at,
            updated_at: returns.updated_at,
        })
        .from(returns)
        .orderBy(desc(returns.returnid));

    // Format the result (convert dates to readable strings)
    const formattedResult = result.map((item) => {
        const formatDate = (date) => (date ? new Date(date).toLocaleString() : null);

        return {
            ...item,
            return_date: formatDate(item.return_date),
            created_at: formatDate(item.created_at),
            updated_at: formatDate(item.updated_at),
        };
    });

    // Return the formatted result
    return res.status(200).json(
        new ApiResponse(200, formattedResult, "Return records fetched successfully")
    );
});


// Update an existing return record
const updateReturn = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { orderid, return_date, qty_returned, reason_for_return, remarks } = req.body;

    // Required field validation
    const requiredFields = ['orderid', 'return_date', 'qty_returned'];
    const missingFields = requiredFields.filter(field => {
        const value = req.body[field];
        return (
            (typeof value !== "string" && typeof value !== "number") ||
            (typeof value === "string" && !value.trim())
        );
    });

    if (missingFields.length > 0) {
        const invalidValues = missingFields.map(field => `${field}: ${req.body[field]}`);
        throw new ApiError(400, `Missing or invalid required fields: ${invalidValues.join(', ')}`);
    }

    // Normalize inputs
    const normalizeReturnData = (data) => ({
        orderid: String(data.orderid).trim(),
        return_date: new Date(data.return_date).toISOString().split('T')[0],
        qty_returned: Number(data.qty_returned),
        reason_for_return: data.reason_for_return ? String(data.reason_for_return).trim() : null,
        remarks: data.remarks ? String(data.remarks).trim() : null,
    });

    const normalizedData = normalizeReturnData(req.body);

    // Validate numeric values
    if (isNaN(normalizedData.qty_returned) || normalizedData.qty_returned < 0) {
        throw new ApiError(400, "Invalid quantity returned. It must be a non-negative number.");
    }

    // Fetch the existing return record
    const existingReturn = await db
        .select()
        .from(returns)
        .where(eq(returns.returnid, id));

    if (!existingReturn.length) {
        throw new ApiError(404, `Return record with id ${id} does not exist`);
    }

    const oldQtyReturned = existingReturn[0].qty_returned;

    // Perform transaction: Update the return record and dealOrders table
    const result = await db.transaction(async (tx) => {
        // Update the return record
        const updatedReturn = await tx
            .update(returns)
            .set(normalizedData)
            .where(eq(returns.returnid, id))
            .returning();

        if (!updatedReturn.length) {
            throw new ApiError(500, "Failed to update Return record");
        }

        // Update the dealOrders table
        const qtyDifference = normalizedData.qty_returned - oldQtyReturned;

        const updateDealOrders = await tx
            .update(dealOrders)
            .set({
                total_returned_qty: sql`${dealOrders.total_returned_qty || 0} + ${qtyDifference}`,
            })
            .where(eq(dealOrders.orderid, normalizedData.orderid))
            .returning();

        if (!updateDealOrders.length) {
            throw new ApiError(500, "Failed to update total_returned_qty in dealOrders");
        }

        return updatedReturn[0];
    });

    // Return success response
    return res.status(200).json(
        new ApiResponse(200, result, "Return record updated successfully")
    );
});


// Delete a return record
const deleteReturn = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Perform transaction to delete the return and update the dealOrders table
    const result = await db.transaction(async (tx) => {
        // Fetch the return record to get qty_returned and orderid
        const existingReturn = await tx
            .select()
            .from(returns)
            .where(eq(returns.returnid, id));

        if (!existingReturn.length) {
            throw new ApiError(404, "Return record not found");
        }

        const { orderid, qty_returned } = existingReturn[0];

        // Delete the return record
        const deletedReturn = await tx
            .delete(returns)
            .where(eq(returns.returnid, id))
            .returning();

        if (!deletedReturn.length) {
            throw new ApiError(500, "Failed to delete Return record");
        }

        // Update the dealOrders table
        const updateDealOrders = await tx
            .update(dealOrders)
            .set({
                total_returned_qty: sql`${dealOrders.total_returned_qty || 0} - ${qty_returned}`,
            })
            .where(eq(dealOrders.orderid, orderid))
            .returning();

        if (!updateDealOrders.length) {
            throw new ApiError(500, "Failed to update total_returned_qty in dealOrders");
        }

        return deletedReturn[0];
    });

    // Return success response
    return res.status(200).json(
        new ApiResponse(200, result, "Return record deleted successfully")
    );
});


export {
    createReturn,
    getAllReturns,
    updateReturn,
    deleteReturn
};