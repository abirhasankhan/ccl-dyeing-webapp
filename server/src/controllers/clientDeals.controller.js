import { db } from "../config/drizzleSetup.js";
import { clientDeals } from "../models/clientDeals.model.js";
import { eq, ilike } from 'drizzle-orm';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Client } from "../models/client.model.js"
import { sql } from 'drizzle-orm';


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


// Get all records
const getClientDeals = asyncHandler(async (req, res) => {

    const result = await db
        .select({
            deal_id: clientDeals.deal_id,
            clientid: clientDeals.clientid,
            payment_method: clientDeals.payment_method,
            issue_date: clientDeals.issue_date,
            valid_through: clientDeals.valid_through,
            representative: clientDeals.representative,
            designation: clientDeals.designation,
            contact_no: clientDeals.contact_no,
            branch: sql`${clientDeals.bankInfo} ->> 'branch'`.as('branch'),      // ✅ Fixed JSON extraction
            bankName: sql`${clientDeals.bankInfo} ->> 'bankName'`.as('bankName'),
            sortCode: sql`${clientDeals.bankInfo} ->> 'sortCode'`.as('sortCode'),
            notes: clientDeals.notes,
            status: clientDeals.status,
        })
        .from(clientDeals)
        .orderBy(clientDeals.deal_id);


    // Format the result to ensure consistency
    const formattedResult = result.map(deal => ({
        ...deal,
        bankInfo: deal.bankInfo ? {
            bankName: deal.bankInfo.bankName || '',
            branch: deal.bankInfo.branch || '',
            sortCode: deal.bankInfo.sortCode || '',
        } : { bankName: '', branch: '', sortCode: '' },  // Default to empty values
    }));

    return res.status(200).json(
        new ApiResponse(200,  formattedResult , "ClientDeals fetched successfully")
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
