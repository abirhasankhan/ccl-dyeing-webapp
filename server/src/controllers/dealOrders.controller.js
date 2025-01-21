import { db } from "../config/drizzleSetup.js";
import { dealOrders } from "../models/dealOrders.model.js";
import { eq, desc } from 'drizzle-orm';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { clientDeals } from "../models/clientDeals.model.js";


// Create a new record
const createDealOrder = asyncHandler(async (req, res) => {
    
    const { deal_id, challan_no, booking_qty, total_received_qty, total_returned_qty, status, notes, remarks } = req.body;

    // Required field validation
    const requiredFields = ['deal_id', 'challan_no', 'booking_qty', 'total_received_qty'];
    const missingFields = requiredFields.filter(field =>
        typeof req.body[field] !== "string" || !req.body[field].trim()
    );

    if (missingFields.length > 0) {
        throw new ApiError(400, `Missing required fields: ${missingFields.join(', ')}`);
    }

    // Normalize inputs by trimming strings where applicable
    const normalizedDeal_id = deal_id.trim();
    const normalizedChallan_no = challan_no.trim();
    const normalizedBookingQty = Number(booking_qty) || 0;
    const normalizedTotalReceivedQty = Number(total_received_qty) || 0;
    const normalizedTotalReturnedQty = Number(total_returned_qty) || 0;
    const normalizedNotes = notes?.trim() || null;
    const normalizedRemarks = remarks?.trim() || null;
    const normalizedStatus = remarks?.trim() || "Pending";

    // Validate numeric values
    if (isNaN(normalizedBookingQty) || isNaN(normalizedTotalReceivedQty) || isNaN(normalizedTotalReturnedQty)) {
        throw new ApiError(400, "Invalid numeric values provided for Booking Qty, Total Received Qty, or Total Returned Qty");
    }

    // Check if the Client Deal exists
    const existingClientDeal = await db
        .select()
        .from(clientDeals)
        .where(eq(clientDeals.deal_id, normalizedDeal_id));

    if (!existingClientDeal.length) {
        throw new ApiError(404, "Client Deal not found");
    }

    // Create a new record in the database
    const newDealOrder = {
        deal_id: normalizedDeal_id,
        challan_no: normalizedChallan_no,
        booking_qty: normalizedBookingQty,
        total_received_qty: normalizedTotalReceivedQty,
        total_returned_qty: normalizedTotalReturnedQty,
        status: normalizedStatus,
        notes: normalizedNotes,
        remarks: normalizedRemarks,
    };

    const result = await db.insert(dealOrders).values(newDealOrder).returning();

    if (!result.length) {
        throw new ApiError(500, "Failed to create Deal Order");
    }

    res.status(201).json(
        new ApiResponse(201, result[0], "Deal Order registered successfully")
    );

});

// Featch all records

const getAllDealOrders = asyncHandler(async (req, res) => {
    const result = await db
        .select({
            orderid: dealOrders.orderid,
            deal_id: dealOrders.deal_id,
            challan_no: dealOrders.challan_no,
            booking_qty: dealOrders.booking_qty,
            total_received_qty: dealOrders.total_received_qty,
            total_returned_qty: dealOrders.total_returned_qty,
            status: dealOrders.status,
            notes: dealOrders.notes,
            created_at: dealOrders.created_at,
            updated_at: dealOrders.updated_at,
            remarks: dealOrders.remarks
        })
        .from(dealOrders)
        .orderBy(desc(dealOrders.orderid)); // Sort by created_at in descending order

    const formattedResult = result.map(order => ({
        ...order,
        created_at: new Date(order.created_at).toLocaleString(),
        updated_at: new Date(order.updated_at).toLocaleString()
    }));

    return res.status(200).json(
        new ApiResponse(200, formattedResult, "Deal Orders fetched successfully")
    );
});


// Update an existing Deal Order
const updateDealOrder = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { deal_id, challan_no, booking_qty, total_received_qty, total_returned_qty, status, notes, remarks } = req.body;

    // Required field validation

    // Required field validation
    const requiredFields = ['deal_id', 'challan_no',];
    const missingFields = requiredFields.filter(field =>
        typeof req.body[field] !== "string" || !req.body[field].trim()
    );

    if (missingFields.length > 0) {
        throw new ApiError(400, `Missing required fields: ${missingFields.join(', ')}`);
    }

    // Normalize inputs by trimming strings where applicable
    const normalizedDeal_id = deal_id?.trim();
    const normalizedChallan_no = challan_no?.trim();
    // Optional: You can add a fallback if they're not valid numbers
    const normalizedBookingQty = isNaN(Number(booking_qty)) ? 0 : Number(booking_qty);
    const normalizedTotalReceivedQty = isNaN(Number(total_received_qty)) ? 0 : Number(total_received_qty);
    const normalizedTotalReturnedQty = isNaN(Number(total_returned_qty)) ? 0 : Number(total_returned_qty);
    const normalizedNotes = notes?.trim() || null;
    const normalizedStatus = status?.trim() || "Pending";
    const normalizedRemarks = remarks?.trim() || null;

    // Validate numeric values
    if (isNaN(normalizedBookingQty) || isNaN(normalizedTotalReceivedQty) || isNaN(normalizedTotalReturnedQty)) {
        throw new ApiError(400, "Invalid numeric values provided for Booking Qty, Total Received Qty, or Total Returned Qty");
    }

    // Check if the Client Deal exists
    const existingClientDeal = await db
        .select()
        .from(clientDeals)
        .where(eq(clientDeals.deal_id, normalizedDeal_id));

    if (existingClientDeal.length === 0) {
        throw new ApiError(404, "Client Deal not found");
    }

    // Update the record in the database
    const updatedDealOrder = {
        deal_id: normalizedDeal_id,
        challan_no: normalizedChallan_no,
        booking_qty: normalizedBookingQty,
        total_received_qty: normalizedTotalReceivedQty,
        total_returned_qty: normalizedTotalReturnedQty,
        status: normalizedStatus,
        notes: normalizedNotes,
        remarks: normalizedRemarks,
    };

    const result = await db
        .update(dealOrders)
        .set(updatedDealOrder)
        .where(eq(dealOrders.orderid, id))
        .returning();

    if (result.length === 0) {
        throw new ApiError(500, "Failed to update Deal Order");
    }

    res.status(200).json(
        new ApiResponse(200, result[0], "Deal Order updated successfully")
    )
});

// Delete a Deal Order
const deleteDealOrder = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const deletedDealOrder = await db.delete(dealOrders).where(eq(dealOrders.orderid, id)).returning(); // returning() returns the deleted row, not rows affected

    // Check if anything was deleted    
    if (deletedDealOrder.length === 0) {
        throw new ApiError(404, "Deal Order not found");
    }

    return res.status(200).json(
        new ApiResponse(200, deletedDealOrder, "Deal Order deleted successfully")
    )
});


export {
    createDealOrder,
    getAllDealOrders,
    updateDealOrder,
    deleteDealOrder
}
