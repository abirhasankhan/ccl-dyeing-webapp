import { db } from "../config/drizzleSetup.js";
import { invoices } from "../models/invoice.model.js";
import { payments } from "../models/payment.model.js";

import { eq } from "drizzle-orm";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

// Create a new invoice
const createInvoice = asyncHandler(async (req, res) => {
    const { processid, clientid, amount, due_date } = req.body;

    // Validate required fields
    if (!processid || !clientid || !amount || !due_date) {
        throw new ApiError(400, "All fields are required");
    }

    // Create invoice
    const newInvoice = await db
        .insert(invoices)
        .values({
            processid,
            clientid,
            amount,
            due_date: new Date(due_date),
            status: "Unpaid",
        })
        .returning();

    if (!newInvoice.length) {
        throw new ApiError(500, "Failed to create invoice");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, newInvoice[0], "Invoice created successfully"));
});

// Record a payment
const recordPayment = asyncHandler(async (req, res) => {
    const { invoiceid, amount, payment_method } = req.body;

    // Validate required fields
    if (!invoiceid || !amount || !payment_method) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if invoice exists
    const invoice = await db.select().from(invoices).where(eq(invoices.invoiceid, invoiceid));
    if (!invoice.length) {
        throw new ApiError(404, "Invoice not found");
    }

    // Record payment
    const newPayment = await db
        .insert(payments)
        .values({
            invoiceid,
            amount,
            payment_method,
        })
        .returning();

    if (!newPayment.length) {
        throw new ApiError(500, "Failed to record payment");
    }

    // Update invoice status
    const totalPaid = await db
        .select({ total: sql`SUM(amount)` })
        .from(payments)
        .where(eq(payments.invoiceid, invoiceid));

    const totalAmount = invoice[0].amount;
    const paidAmount = totalPaid[0].total || 0;

    let status = "Unpaid";
    if (paidAmount >= totalAmount) {
        status = "Paid";
    } else if (paidAmount > 0) {
        status = "Partially Paid";
    }

    await db
        .update(invoices)
        .set({ status })
        .where(eq(invoices.invoiceid, invoiceid));

    return res
        .status(201)
        .json(new ApiResponse(201, newPayment[0], "Payment recorded successfully"));
});

// Get all invoices for a client
const getClientInvoices = asyncHandler(async (req, res) => {
    const { clientid } = req.params;

    const clientInvoices = await db
        .select()
        .from(invoices)
        .where(eq(invoices.clientid, clientid));

    return res
        .status(200)
        .json(new ApiResponse(200, clientInvoices, "Client invoices fetched successfully"));
});

export { createInvoice, recordPayment, getClientInvoices };