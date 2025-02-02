import { db } from "../config/drizzleSetup.js";
import { clientDeals } from "../models/clientDeals.model.js";
import { dyeingFinishingDeals } from "../models/dyeingFinishingDeals.model.js";
import { additionalProcessDeals } from "../models/additionalProcessDeals.model.js";

import { eq, ilike, count, sql } from 'drizzle-orm';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Client } from "../models/client.model.js"
import PDFDocument from 'pdfkit';


// Function to generate a PDF document
const generatePDF = (deal) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        let buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });

        doc.on('error', (err) => {
            reject(err);
        });

        doc.fontSize(16).text("Client Deal Details", { align: 'center' });
        doc.moveDown();

        doc.fontSize(12)
            .text(`Deal ID: ${deal.deal_id}`)
            .text(`Client ID: ${deal.clientid}`)
            .text(`Payment Method: ${deal.payment_method}`)
            .text(`Issue Date: ${deal.issue_date}`)
            .text(`Valid Through: ${deal.valid_through}`)
            .text(`Representative: ${deal.representative}`)
            .text(`Designation: ${deal.designation}`)
            .text(`Contact No: ${deal.contact_no}`)
            .text(`Bank Name: ${deal.bankName}`)
            .text(`Branch: ${deal.branch}`)
            .text(`Sort Code: ${deal.sortCode}`)
            .text(`Notes: ${deal.notes || 'N/A'}`)
            .text(`Status: ${deal.status || 'N/A'}`)
            .moveDown();

        doc.end();
    });
};


// Create a new record
const createClientDeals = asyncHandler(async (req, res) => {

    const { clientid, payment_method, issue_date, valid_through, representative, designation, contact_no, bankInfo, notes, remarks } = req.body;

    // Define required fields and check for missing ones
    const requiredFields = ['clientid', 'payment_method', 'issue_date', 'valid_through', 'representative', 'designation', 'contact_no'];
    const missingFields = requiredFields.filter(field => !req.body[field]?.trim());

    if (missingFields.length > 0) {
        throw new ApiError(400, `Missing required fields: ${missingFields.join(', ')}`);
    }

    // Normalize inputs by trimming strings where applicable
    const normalizedClientid = clientid?.trim();
    const normalizedPaymentMethod = payment_method?.trim();
    const normalizedIssueDate = issue_date?.trim();
    const normalizedValidThrough = valid_through?.trim();
    const normalizedRepresentative = representative?.trim();
    const normalizedDesignation = designation?.trim();
    const normalizedContactNo = contact_no?.trim();
    const normalizedNotes = notes?.trim() || null;
    const normalizedRemarks = remarks?.trim() || null;

    // Validate and normalize bankInfo (JSON)
    let normalizedBankInfo = null;
    if (bankInfo) {
        try {
            normalizedBankInfo = typeof bankInfo === 'string'
                ? JSON.parse(bankInfo)
                : bankInfo;
        } catch (error) {
            throw new ApiError(400, "Invalid bankInfo JSON format");
        }
    }

    // Check if the client exists and stop execution if not found
    const existClient = await db.select().from(Client).where(eq(Client.clientid, normalizedClientid));
    
    if (existClient.length === 0) {
        
        throw new ApiError(404, "Client not found");
    }

    // Prepare the new client deal object
    const newClientDeals = {
        clientid: normalizedClientid,
        payment_method: normalizedPaymentMethod,
        issue_date: normalizedIssueDate,
        valid_through: normalizedValidThrough,
        representative: normalizedRepresentative,
        designation: normalizedDesignation,
        contact_no: normalizedContactNo,
        bankInfo: normalizedBankInfo,
        notes: normalizedNotes,
        remarks: normalizedRemarks,
    };

    // Insert the new client deal record
    const result = await db.insert(clientDeals).values(newClientDeals).returning();

    if (result.length === 0) {
        throw new ApiError(500, "Failed to create ClientDeals");
    }

    // Return the successful response
    return res.status(201).json(
        new ApiResponse(201, result[0], "ClientDeals created successfully")
    );
});


// Get all records and generate PDFs
const getClientDeals = asyncHandler(async (req, res) => {
    
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Fetch client deals with pagination
    const clientDealsQuery = db
        .select({
            deal_id: clientDeals.deal_id,
            clientid: clientDeals.clientid,
            payment_method: clientDeals.payment_method,
            issue_date: clientDeals.issue_date,
            valid_through: clientDeals.valid_through,
            representative: clientDeals.representative,
            designation: clientDeals.designation,
            contact_no: clientDeals.contact_no,
            branch: sql`
                    COALESCE(NULLIF(${clientDeals.bankInfo} ->> 'branch', ''), 'N/A')
                `.as('branch'),
                            bankName: sql`
                    COALESCE(NULLIF(${clientDeals.bankInfo} ->> 'bankName', ''), 'N/A')
                `.as('bankName'),
                            sortCode: sql`
                    COALESCE(NULLIF(${clientDeals.bankInfo} ->> 'sortCode', ''), 'N/A')
                `.as('sortCode'),
            notes: clientDeals.notes,
            status: clientDeals.status,
        })
        .from(clientDeals)
        .orderBy(clientDeals.deal_id)
        .limit(limit)
        .offset(offset);

    // Fetch client data
    const clientQuery = db
        .select({
            clientid: Client.clientid,
            companyname: Client.companyname,
            address: Client.address,
            contact: Client.contact,
            email: Client.email,
        })
        .from(Client);

    // Fetch related deals
    const dyeingFinishingDealsQuery = db
        .select({
            deal_id: dyeingFinishingDeals.deal_id,
            color: dyeingFinishingDeals.color,
            shade_percent: dyeingFinishingDeals.shade_percent,
            tube_tk: dyeingFinishingDeals.tube_tk,
            open_tk: dyeingFinishingDeals.open_tk,
            elasteen_tk: dyeingFinishingDeals.elasteen_tk,
            double_dyeing_tk: dyeingFinishingDeals.double_dyeing_tk,
            notes: dyeingFinishingDeals.notes,
        })
        .from(dyeingFinishingDeals);

    const additionalProcessDealsQuery = db
        .select({
            deal_id: additionalProcessDeals.deal_id,
            process_type: additionalProcessDeals.process_type,
            price_tk: additionalProcessDeals.price_tk,
            notes: additionalProcessDeals.notes,
        })
        .from(additionalProcessDeals);

    // Execute all queries concurrently
    const [clientDealsResult, dyeingFinishingDealsResult, additionalProcessDealsResult, clientQueryResult] = await Promise.all([
        clientDealsQuery,
        dyeingFinishingDealsQuery,
        additionalProcessDealsQuery,
        clientQuery,
    ]);

    // Helper function to format dates
    const formatDate = (date) => (date ? new Date(date).toLocaleString() : "N/A");

    // Format client deals, dates, and related data
    const formattedClientDeals = clientDealsResult.map((clientDeal) => {
        if (!clientDeal) return {}; // Skip invalid entries

        const client = clientQueryResult
            .filter((c) => c.clientid === clientDeal.clientid)
            .map((c) => ({
                companyname: c.companyname,
                address: c.address,
                contact: c.contact,
                email: c.email,
            })) || [];

        const dyeingFinishingDeals = dyeingFinishingDealsResult
            ?.filter((dfDeal) => dfDeal.deal_id === clientDeal.deal_id)
            .map((dfDeal) => ({
                color: dfDeal.color,
                shade_percent: dfDeal.shade_percent,
                tube_tk: dfDeal.tube_tk,
                open_tk: dfDeal.open_tk,
                elasteen_tk: dfDeal.elasteen_tk,
                double_dyeing_tk: dfDeal.double_dyeing_tk,
                notes: dfDeal.notes,
            })) || [];

        const additionalProcessDeals = additionalProcessDealsResult
            ?.filter((apDeal) => apDeal.deal_id === clientDeal.deal_id)
            .map((apDeal) => ({
                process_type: apDeal.process_type,
                price_tk: apDeal.price_tk,
                notes: apDeal.notes,
            })) || [];

        // Format the dates
        return {
            ...clientDeal,
            client,
            dyeingFinishingDeals,
            additionalProcessDeals,
            issue_date: formatDate(clientDeal.issue_date),
            valid_through: formatDate(clientDeal.valid_through),
        };
    });

    // Assuming you have a query to count total records
    const totalCountResult = await db.select({ total: count() }).from(clientDeals);
    const totalCount = totalCountResult[0].total;
    const totalPages = Math.ceil(totalCount / limit);

    // Generate PDFs for each deal
    const pdfFiles = [];
    for (const deal of formattedClientDeals) {
        try {
            const pdfData = await generatePDF(deal);
            pdfFiles.push({
                ...deal,
                filename: `deal_${deal.deal_id}.pdf`,
            });
        } catch (error) {
            console.error(`Failed to generate PDF for deal ${deal.deal_id}:`, error);
        }
    }

    if (pdfFiles.length === 0) {
        throw new ApiError(500, "Failed to generate any PDFs");
    }

    return res.status(200).json(
        new ApiResponse(200, { deals: pdfFiles, page, limit, totalCount, totalPages }, "ClientDeals PDFs generated successfully")
    );
});




// Update an existing record
const updateClientDeals = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const { clientid, payment_method, issue_date, valid_through, representative, designation, contact_no, bankInfo, notes, status, remarks } = req.body;

    // Define required fields and check for missing ones
    const requiredFields = ['clientid', 'payment_method', 'issue_date', 'valid_through', 'representative', 'designation', 'contact_no'];
    const missingFields = requiredFields.filter(field => !req.body[field]?.trim());

    if (missingFields.length > 0) {
        throw new ApiError(400, `Missing required fields: ${missingFields.join(', ')}`);
    }

    // Normalize inputs by trimming strings where applicable
    const normalizedClientid = clientid?.trim();
    const normalizedPaymentMethod = payment_method?.trim();
    const normalizedIssueDate = issue_date?.trim();
    const normalizedValidThrough = valid_through?.trim();
    const normalizedRepresentative = representative?.trim();
    const normalizedDesignation = designation?.trim();
    const normalizedContactNo = contact_no?.trim();
    const normalizedNotes = notes?.trim() || null;
    const normalizedStatus = status?.trim();
    const normalizedRemarks = remarks?.trim() || null;

    // Validate and normalize bankInfo (JSON)
    let normalizedBankInfo = null;
    if (bankInfo) {
        try {
            normalizedBankInfo = typeof bankInfo === 'string'
                ? JSON.parse(bankInfo)
                : bankInfo;
        } catch (error) {
            throw new ApiError(400, "Invalid bankInfo JSON format");
        }
    }

    // Check if the client exists and stop execution if not found
    const existClient = await db.select().from(Client).where(eq(Client.clientid, normalizedClientid));

    if (existClient.length === 0) {

        throw new ApiError(404, "Client not found");
    }

    const updatedClientDeals = {
        clientid: normalizedClientid,
        payment_method: normalizedPaymentMethod,
        issue_date: normalizedIssueDate,
        valid_through: normalizedValidThrough,
        representative: normalizedRepresentative,
        designation: normalizedDesignation,
        contact_no: normalizedContactNo,
        bankInfo: normalizedBankInfo,
        notes: normalizedNotes,
        status: normalizedStatus,
        remarks: normalizedRemarks,
    }

    const result = await db.update(clientDeals).set(updatedClientDeals).where(eq(clientDeals.deal_id, id)).returning();

    if (result.length === 0) {
        throw new ApiError(500, "Failed to update ClientDeals");
    }

    return res.status(200).json(
        new ApiResponse(200, result, "ClientDeals updated successfully")
    )
});


// Delete an existing record
const deleteClientDeals = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const deletedClientDeals = await db.delete(clientDeals).where(eq(clientDeals.deal_id, id)).returning(); // returning() returns the deleted row, not rows affected

    // Check if anything was deleted
    if (deletedClientDeals.length === 0) {
        throw new ApiError(404, "ClientDeals not found");
    }    

    return res.status(200).json(
        new ApiResponse(200, deletedClientDeals, "ClientDeals deleted successfully")
    );
});

// Search ClientDeals
const searchClientDeals = asyncHandler(async (req, res) => {

    const { deal_id, clientid, representative, contactNo } = req.query;

    if (!deal_id && !clientid && !representative && !contactNo ){
        throw new ApiError(404, "Either 'deal_id' or 'clientid' or 'representative' or 'contactNo' query parameter is required.");
    }
    

    let clientDeal;

    if (deal_id) {
        clientDeal = await db.select.from(clientDeals).where(eq(clientDeals.deal_id, deal_id));
    } else if (clientid){
        clientDeal = await db.select.from(clientDeals).where(eq(clientDeals.clientid, clientid));
    } else if (representative) {
        // Search by name
        clientDeal = await db
            .select()
            .from(clientDeals)
            .where(ilike(clientDeals.representative, `%${representative}%`)); // Case-insensitive LIKE search
    } else if (contactNo) {
        // Search by name
        clientDeal = await db
            .select()
            .from(clientDeals)
            .where(ilike(clientDeals.contactNo, `%${contactNo}%`)); // Case-insensitive LIKE search
    }

    if (clientDeal.length === 0) {
        throw new ApiError(404, "No ClientDeals found with the specified criteria.");
    }

    return res.status(200).json(
        new ApiResponse(200, clientDeal, "Data found")
    );

});    


export {
    createClientDeals,
    getClientDeals,
    updateClientDeals,
    deleteClientDeals,
    searchClientDeals
}
