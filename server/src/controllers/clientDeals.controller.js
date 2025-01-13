import { db } from "../config/drizzleSetup.js";
import { clientDeals } from "../models/createClientDeals.model.js";
import { eq, ilike } from 'drizzle-orm';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";


// Create a new record
const createClientDeals = asyncHandler(async (req, res) => {

    const { clientid, paymentMethod, issueDate, validThrough, representative, designation, contactNo, bankInfo, notes, remarks } = req.body;

    const requiredFields = ['clientid', 'paymentMethod', 'issueDate', 'validThrough', 'representative', 'designation', 'contactNo'];

    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
        throw new ApiError(400, `Missing required fields: ${missingFields.join(', ')}`);
    }


    // Normalize inputs by trimming strings
    const normalizedClientid = clientid.trim();
    const normalizedPaymentMethod = paymentMethod.trim();
    const normalizedIssueDate = issueDate.trim();
    const normalizedValidThrough = validThrough.trim();
    const normalizedRepresentative = representative.trim();
    const normalizedDesignation = designation.trim();
    const normalizedContactNo = contactNo.trim();
    const normalizedBankInfo = bankInfo?.trim() || null;
    const normalizedNotes = notes?.trim() || null;
    const normalizedRemarks = remarks?.trim() || null;


    const newClientDeals = {
        clientid: normalizedClientid,
        paymentMethod: normalizedPaymentMethod,
        issueDate: normalizedIssueDate,
        validThrough: normalizedValidThrough,
        representative: normalizedRepresentative,
        designation: normalizedDesignation,
        contactNo: normalizedContactNo,
        bankInfo: normalizedBankInfo,
        notes: normalizedNotes,
        remarks: normalizedRemarks,
    }

    const result = await db.insert(clientDeals).values(newClientDeals).returning();

    if (result.length === 0) {
        throw new ApiError(404, "ClientDeals not found");
    }

    return res.status(201).json(
        new ApiResponse(201, result, "ClientDeals created successfully")
    );

});


// Get all records
const getClientDeals = asyncHandler(async (req, res) => {

    const result = await db.select().from(clientDeals);
    return res.status(200).json(
        new ApiResponse(200, result, "ClientDeals fetched successfully")    
    );
})

// Update an existing record
const updateClientDeals = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { clientid, paymentMethod, issueDate, validThrough, representative, designation, contactNo, bankInfo, notes, remarks } = req.body;

    // Check if the ClientDeals exists
    const existingClientDeals = await db.select().from(clientDeals).where(eq(clientDeals.dealId, id));

    if (existingClientDeals.length === 0) {
        throw new ApiError(404, "ClientDeals not found");
    }

    // Normalize inputs by trimming strings
    const normalizedClientid = clientid.trim();
    const normalizedPaymentMethod = paymentMethod.trim();
    const normalizedIssueDate = issueDate.trim();
    const normalizedValidThrough = validThrough.trim();
    const normalizedRepresentative = representative.trim();
    const normalizedDesignation = designation.trim();
    const normalizedContactNo = contactNo.trim();
    const normalizedBankInfo = bankInfo?.trim() || null;
    const normalizedNotes = notes?.trim() || null;
    const normalizedRemarks = remarks?.trim() || null;  

    const updatedClientDeals = {
        clientid: normalizedClientid,
        paymentMethod: normalizedPaymentMethod,
        issueDate: normalizedIssueDate,
        validThrough: normalizedValidThrough,
        representative: normalizedRepresentative,
        designation: normalizedDesignation,
        contactNo: normalizedContactNo,
        bankInfo: normalizedBankInfo,
        notes: normalizedNotes,
        remarks: normalizedRemarks,
    }

    const result = await db.update(clientDeals).set(updatedClientDeals).where(eq(clientDeals.dealId, id)).returning();

    if (result.length === 0) {
        throw new ApiError(404, "ClientDeals not found");
    }

    return res.status(200).json(
        new ApiResponse(200, result, "ClientDeals updated successfully")
    )
});


// Delete an existing record
const deleteClientDeals = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const deletedClientDeals = await db.delete(clientDeals).where(eq(clientDeals.dealId, id)).returning(); // returning() returns the deleted row, not rows affected

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
        clientDeal = await db.select.from(clientDeals).where(eq(clientDeals.dealId, deal_id));
    } else if (clientid){
        clientDeal = await db.select.from(clientDeals).where(eq(clientDeals.clientId, clientid));
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
