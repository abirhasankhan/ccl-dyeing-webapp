import { db } from "../config/drizzleSetup.js";
import { invoices } from "../models/invoices.model.js";
import { payments } from "../models/payment.model.js";
import { eq, sql, desc } from "drizzle-orm";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

// Create a new payment
const createPayment = asyncHandler(async (req, res) => {

    const { invoiceid, amount, payment_method, notes, remarks } = req.body;

    // Validate required fields
    if (!invoiceid || !amount) {
        throw new ApiError(400, "invoiceid, amount, and payment_method are required");
    }

    // Normalize inputs
    const normalizedInvoiceId = String(invoiceid).trim();
    const normalizedAmount = Number(amount);
    const normalizedPaymentMethod = String(payment_method).trim();
    const normalizedNotes = notes ? String(notes).trim() : null;
    const normalizedRemarks = remarks ? String(remarks).trim() : null;

    // Validate numeric values
    if (isNaN(normalizedAmount) || normalizedAmount <= 0) {
        throw new ApiError(400, "Amount must be a positive number");
    }

    // Fetch the invoice to check the total amount
    const invoice = await db
        .select()
        .from(invoices)
        .where(eq(invoices.invoiceid, normalizedInvoiceId));

    if (!invoice.length) {
        throw new ApiError(404, "Invoice not found");
    }

    const totalAmount = invoice[0].amount;
    const paidAmount = invoice[0].paid_amount || 0;

    // Check if the new payment exceeds the invoice amount
    if (paidAmount + normalizedAmount > totalAmount) {
        throw new ApiError(400, "Payment amount exceeds the invoice total amount");
    }

    // Create the payment
    const newPayment = {
        invoiceid: normalizedInvoiceId,
        amount: normalizedAmount,
        payment_method: normalizedPaymentMethod,
        notes: normalizedNotes,
        remarks: normalizedRemarks,
    };

    // Perform transaction: Insert payment and update invoice's paid_amount
    const result = await db.transaction(async (tx) => {
        // Insert payment
        const paymentResult = await tx
            .insert(payments)
            .values(newPayment)
            .returning();

        if (!paymentResult.length) {
            throw new ApiError(500, "Failed to create payment");
        }

        // Update invoice's paid_amount
        const updatedInvoice = await tx
            .update(invoices)
            .set({
                paid_amount: sql`${invoices.paid_amount || 0} + ${normalizedAmount}`,
                status: sql`CASE 
                    WHEN ${invoices.paid_amount || 0} + ${normalizedAmount} >= ${totalAmount} THEN 'Paid'
                    ELSE 'Partially Paid'
                END`,
            })
            .where(eq(invoices.invoiceid, normalizedInvoiceId))
            .returning();

        if (!updatedInvoice.length) {
            throw new ApiError(500, "Failed to update invoice");
        }

        return paymentResult[0];
    });

    return res
        .status(201)
        .json(new ApiResponse(201, result, "Payment created successfully"));
});

// Get all payments
const getPayments = asyncHandler(async (req, res) => {

    const result = await db.select().from(payments).orderBy(desc(payments.paymentid));
    ;

    // Format the result (convert dates to readable strings)
    const formattedResult = result.map((item) => {
        const formatDate = (date) => (date ? new Date(date).toLocaleString() : null);

        return {
            ...item,
            created_at: formatDate(item.created_at),
            updated_at: formatDate(item.updated_at),
        };
    });
    return res.status(200).json(new ApiResponse(200, formattedResult, "Payments retrieved successfully"));
});

// Update a payment
const updatePayment = asyncHandler(async (req, res) => {

    const { id } = req.params; // Payment ID to update
    const { amount, payment_method, notes, remarks } = req.body;

    // Validate required fields
    if (!amount && !payment_method && !notes && !remarks) {
        throw new ApiError(400, "At least one field (amount, payment_method, notes, remarks) is required");
    }

    // Normalize inputs
    const normalizedAmount = amount ? Number(amount) : null;
    const normalizedPaymentMethod = payment_method ? String(payment_method).trim() : null;
    const normalizedNotes = notes ? String(notes).trim() : null;
    const normalizedRemarks = remarks ? String(remarks).trim() : null;

    // Validate numeric values
    if (normalizedAmount !== null && (isNaN(normalizedAmount) || normalizedAmount <= 0)) {
        throw new ApiError(400, "Amount must be a positive number");
    }

    // Fetch the payment to get the invoice ID
    const payment = await db
        .select()
        .from(payments)
        .where(eq(payments.paymentid, id));

    if (!payment.length) {
        throw new ApiError(404, "Payment not found");
    }

    const invoiceId = payment[0].invoiceid;
    const oldAmount = payment[0].amount;

    // Fetch the invoice to check the total amount
    const invoice = await db
        .select()
        .from(invoices)
        .where(eq(invoices.invoiceid, invoiceId));

    if (!invoice.length) {
        throw new ApiError(404, "Invoice not found");
    }

    const totalAmount = invoice[0].amount;
    const paidAmount = invoice[0].paid_amount || 0;

    // Check if the updated payment exceeds the invoice amount
    if (normalizedAmount !== null && paidAmount - oldAmount + normalizedAmount > totalAmount) {
        throw new ApiError(400, "Updated payment amount exceeds the invoice total amount");
    }

    // Prepare the updated payment object
    const updatedPayment = {
        amount: normalizedAmount !== null ? normalizedAmount : payment[0].amount,
        payment_method: normalizedPaymentMethod || payment[0].payment_method,
        notes: normalizedNotes || payment[0].notes,
        remarks: normalizedRemarks || payment[0].remarks,
    };

    // Perform transaction: Update payment and update invoice's paid_amount
    const result = await db.transaction(async (tx) => {
        // Update payment
        const paymentResult = await tx
            .update(payments)
            .set(updatedPayment)
            .where(eq(payments.paymentid, id))
            .returning();

        if (!paymentResult.length) {
            throw new ApiError(500, "Failed to update payment");
        }

        // Update invoice's paid_amount
        const amountDifference = updatedPayment.amount - oldAmount;

        const updatedInvoice = await tx
            .update(invoices)
            .set({
                paid_amount: sql`${invoices.paid_amount || 0} + ${amountDifference}`,
                status: sql`CASE 
                    WHEN ${invoices.paid_amount || 0} + ${amountDifference} >= ${totalAmount} THEN 'Paid'
                    ELSE 'Partially Paid'
                END`,
            })
            .where(eq(invoices.invoiceid, invoiceId))
            .returning();

        if (!updatedInvoice.length) {
            throw new ApiError(500, "Failed to update invoice");
        }

        return paymentResult[0];
    });

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Payment updated successfully"));
});

// Delete a payment
const deletePayment = asyncHandler(async (req, res) => {

    const { id } = req.params; // Payment ID to delete

    // Fetch the payment to get the invoice ID and amount
    const payment = await db
        .select()
        .from(payments)
        .where(eq(payments.paymentid, id));

    if (!payment.length) {
        throw new ApiError(404, "Payment not found");
    }

    const invoiceId = payment[0].invoiceid;
    const amount = payment[0].amount;

    // Perform transaction: Delete payment and update invoice's paid_amount
    const result = await db.transaction(async (tx) => {
        // Delete payment
        const deletedPayment = await tx
            .delete(payments)
            .where(eq(payments.paymentid, id))
            .returning();

        if (!deletedPayment.length) {
            throw new ApiError(500, "Failed to delete payment");
        }

        // Update invoice's paid_amount
        const updatedInvoice = await tx
            .update(invoices)
            .set({
                paid_amount: sql`${invoices.paid_amount || 0} - ${amount}`,
                status: sql`CASE 
                    WHEN ${invoices.paid_amount || 0} - ${amount} <= 0 THEN 'Unpaid'
                    ELSE 'Partially Paid'
                END`,
            })
            .where(eq(invoices.invoiceid, invoiceId))
            .returning();

        if (!updatedInvoice.length) {
            throw new ApiError(500, "Failed to update invoice");
        }

        return deletedPayment[0];
    });

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Payment deleted successfully"));
});

export { createPayment, getPayments, updatePayment, deletePayment };