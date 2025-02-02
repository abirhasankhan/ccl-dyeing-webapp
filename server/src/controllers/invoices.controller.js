import { db } from "../config/drizzleSetup.js";
import { invoices } from "../models/invoices.model.js";
import { dyeingProcess } from "../models/dyeingProcess.model.js";
import { productDetails } from "../models/productDetails.model.js";
import { shipments } from "../models/shipments.model.js";
import { dealOrders } from "../models/dealOrders.model.js";
import { clientDeals } from "../models/clientDeals.model.js";
import { Client } from "../models/client.model.js";
import { eq, inArray, count } from "drizzle-orm";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";



// Create a new invoice
const createInvoice = asyncHandler(async (req, res) => {

    // Check if request body is missing
    if (!req.body) {
        throw new ApiError(400, "Request body is missing");
    }


    const { processid, amount, due_date, notes, remarks } = req.body;

    if (!processid || !amount || !due_date) {
        throw new ApiError(400, "All fields are required");
    }

    // Normalize inputs by trimming strings where applicable
    const normalizedProcessid = String(processid).trim();
    const normalizedAmount = Number(amount);
    const normalizedDueDate = new Date(due_date);
    const normalizedNotes = notes ? String(notes).trim() : null;
    const normalizedRemarks = remarks ? String(remarks).trim() : null;

    // Validate numeric values
    if (
        isNaN(normalizedAmount) || normalizedAmount < 0
    ) {
        throw new ApiError(400, "All numeric values must be greater than 0.");
    }

    // Check if the referenced dyeing process exists
    const existingProcess = await db
        .select()
        .from(dyeingProcess)
        .where(eq(dyeingProcess.processid, normalizedProcessid));

    if (!existingProcess.length) {
        throw new ApiError(404, `Dyeing Process with id ${normalizedProcessid} does not exist`);
    }


    const newInvoice = {
        processid: normalizedProcessid,
        amount: normalizedAmount,
        due_date: normalizedDueDate,
        notes: normalizedNotes,
        remarks: normalizedRemarks,
    };

    const result = await db.insert(invoices).values(newInvoice).returning();
        

    if (!result.length) {
        throw new ApiError(500, "Failed to create invoice");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, result[0], "Invoice created successfully"));
});


// Get all invoices
const getAllInvoices = asyncHandler(async (req, res) => {


    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Fetch invoices with pagination and related data
    const invoicesQuery = db
        .select({
            invoiceid: invoices.invoiceid,
            amount: invoices.amount,
            paid_amount: invoices.paid_amount,
            issued_date: invoices.issued_date,
            due_date: invoices.due_date,
            status: invoices.status,
            notes: invoices.notes,
            remarks: invoices.remarks,
            created_at: invoices.created_at,
            updated_at: invoices.updated_at,
            processid: dyeingProcess.processid,
            productdetailid: productDetails.productdetailid,
            shipmentid: shipments.shipmentid,
            orderid: dealOrders.orderid,
            deal_id: clientDeals.deal_id,
            clientid: clientDeals.clientid,
        })
        .from(invoices)
        .leftJoin(dyeingProcess, eq(invoices.processid, dyeingProcess.processid))
        .leftJoin(productDetails, eq(dyeingProcess.productdetailid, productDetails.productdetailid))
        .leftJoin(shipments, eq(productDetails.shipmentid, shipments.shipmentid))
        .leftJoin(dealOrders, eq(shipments.orderid, dealOrders.orderid))
        .leftJoin(clientDeals, eq(dealOrders.deal_id, clientDeals.deal_id))
        .orderBy(invoices.invoiceid)
        .limit(limit)
        .offset(offset);

    // Fetch client details
    const clientQuery = db
        .select({
            clientid: Client.clientid,
            companyname: Client.companyname,
            address: Client.address,
            contact: Client.contact,
            email: Client.email,
        })
        .from(Client);

    // Fetch total count of invoices for pagination
    const totalCountQuery = db
        .select({ total: count() })
        .from(invoices);

    // Execute all queries concurrently
    const [invoicesResult, clientResult, totalCountResult] = await Promise.all([
        invoicesQuery,
        clientQuery,
        totalCountQuery,
    ]);

    // Format the invoice response
    const formattedInvoices = invoicesResult.map((invoice) => {
        const client = clientResult.find((c) => c.clientid === invoice.clientid) || {};

        return {
            ...invoice,
            client: {
                companyname: client.companyname || "N/A",
                address: client.address || "N/A",
                contact: client.contact || "N/A",
                email: client.email || "N/A",
            },
            due_date: invoice.due_date ? new Date(invoice.due_date).toLocaleString() : "N/A",
            issued_date: invoice.issued_date ? new Date(invoice.issued_date).toLocaleString() : "N/A",
            created_at: invoice.created_at ? new Date(invoice.created_at).toLocaleString() : "N/A",
            updated_at: invoice.updated_at ? new Date(invoice.updated_at).toLocaleString() : "N/A",
        };
    });

    // Pagination calculations
    const totalCount = totalCountResult[0].total;
    const totalPages = Math.ceil(totalCount / limit);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    invoices: formattedInvoices,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalCount,
                    totalPages,
                },
                "Invoices fetched successfully"
            )
        );
});


// Update an invoice
const updateInvoice = asyncHandler(async (req, res) => {

    // Check if the request body is missing
    if (!req.body) {
        throw new ApiError(400, "Request body is missing");
    }

    const { id } = req.params;

    const { processid, amount, due_date, status, notes, remarks } = req.body;

    if (!processid || !amount || !due_date) {
        throw new ApiError(400, "All fields are required");
    }

    console.log("Invoice ID:", id);


    // Fetch existing invoice
    const existingInvoice = await db
        .select()
        .from(invoices)
        .where(eq(invoices.invoiceid, id));

    if (!existingInvoice.length) {
        throw new ApiError(404, "Invoice not found");
    }

    // Normalize inputs by trimming strings where applicable
    const normalizedProcessid = String(processid).trim();
    const normalizedAmount = Number(amount);
    const normalizedDueDate = new Date(due_date);
    const normalizedStatus = status?.trim() || "Unpaid";
    const normalizedNotes = notes ? String(notes).trim() : null;
    const normalizedRemarks = remarks ? String(remarks).trim() : null;

    // Validate numeric values
    if (
        isNaN(normalizedAmount) || normalizedAmount < 0
    ) {
        throw new ApiError(400, "All numeric values must be greater than 0.");
    }


    // Check if the referenced dyeing process exists
    const existingProcess = await db
        .select()
        .from(dyeingProcess)
        .where(eq(dyeingProcess.processid, normalizedProcessid));

    if (!existingProcess.length) {
        throw new ApiError(404, `Dyeing Process with id ${normalizedProcessid} does not exist`);
    }

    // Update the invoice
    const updatedInvoice = {
        processid: normalizedProcessid,
        amount: normalizedAmount,
        due_date: normalizedDueDate,
        status: normalizedStatus,
        notes: normalizedNotes,
        remarks: normalizedRemarks,
    }


    const result = await db
        .update(invoices)
        .set(updatedInvoice)
        .where(eq(invoices.invoiceid, id))
        .returning();

    if (!result.length) {
        throw new ApiError(500, "Failed to update invoice");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, result[0], "Invoice updated successfully"));
});


// Delete an invoice (Only if status is "Unpaid")
const deleteInvoice = asyncHandler(async (req, res) => {

    const { id } = req.params;

    // Check if the invoice exists and is unpaid
    const existingInvoice = await db
        .select()
        .from(invoices)
        .where(eq(invoices.invoiceid, id));

    if (!existingInvoice.length) {
        throw new ApiError(404, "Invoice not found");
    }

    if (existingInvoice[0].status !== "Unpaid") {
        throw new ApiError(400, "Only unpaid invoices can be deleted");
    }

    // Delete invoice
    const result = await db.delete(invoices).where(eq(invoices.invoiceid, id)).returning();


    return res
        .status(200)
        .json(new ApiResponse(200, result, "Invoice deleted successfully"));
});

export { createInvoice, getAllInvoices, updateInvoice, deleteInvoice };
