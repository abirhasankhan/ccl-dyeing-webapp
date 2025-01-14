import { db } from "../config/drizzleSetup.js";
import { Client } from "../models/client.model.js";
import { eq, ilike, or, ne, and } from 'drizzle-orm';



// Create a new client
export const createClient = async (req, res) => {

    const { companyname, address, contact, email, remarks } = req.body;

    if (!companyname || !address || !contact || !email) {
        return res.status(400).json(
            {
                message: "All fields are required."

            }
        );
    }

    try {

        // Normalize inputs by trimming strings
        const normalizedCompanyName = companyname.trim();
        const normalizedAddress = address.trim();
        const normalizedContact = contact.trim();
        const normalizedEmail = email.trim().toLowerCase(); // Trim and lowercase email
        const normalizedRemarks = remarks?.trim() || null; // Trim remarks or set to null

        // Check for duplicate email or contact

        // Using an Arrow Function
        // const existingClient = await db
        //     .select()
        //     .from(Client)
        //     .where((row) => row.email === normalizedEmail || row.contact === normalizedContact);


        //Using an Equality Function 
        const existingClient = await db
            .select()
            .from(Client)
            .where(or(eq(Client.email, normalizedEmail), eq(Client.contact, normalizedContact)));

        if (existingClient.length > 0) {
            return res.status(400).send(
                {
                    message: "A client with this email or contact number already exists.",
                }
            );
        }

        const newClient = {
            companyname: normalizedCompanyName,
            address: normalizedAddress,
            contact: normalizedContact,
            email: normalizedEmail,
            remarks: normalizedRemarks,
        };

        const result = await db.insert(Client).values(newClient).returning();
        res.status(201).json(
            {
                success: true,
                data: result[0]
            }
        );

    } catch (error) {
        return res.status(500).json(
            {
                success: false,
                message: "Internal server error",
                details: error.message
            }
        );
    }
};


// Get all clients
export const getClients = async (req, res) => {
    try {
        const clients = await db
            .select()
            .from(Client)
            .orderBy(Client.clientid); // Sorting by clientid in ascending order

        res.status(200).json({
            success: true,
            data: clients,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            details: error.message,
        });
    }
};


// Get a client by ID
export const getClientById = async (req, res) => {

    const { id } = req.params;

    try {

        const client = await db.select()
            .from(Client)
            .where(eq(Client.clientid, id));

        if (client.length === 0) {

            return res.status(404).send(
                { 
                    success: false,
                    message: "Client not found."
                }
            );
        }

        return res.status(200).json(
            {
                success: true,
                data: client[0]
            }
        );

    } catch (error) {
        return res.status(500).send(
            {
                success: false,
                message: "Internal server error",
                details: error.message

            }
        );
    }
};


// Search clients by ID or name
export const searchClients = async (req, res) => {
    const { id, name } = req.query;

    if (!id && !name) {
        return res.status(400).send({
            message: "Either 'id' or 'name' query parameter is required."
        });
    }

    try {
        let clients;

        if (id) {
            // Search by ID
            clients = await db
                .select()
                .from(Client)
                .where(eq(Client.clientid, id));
        } else if (name) {
            // Search by name
            clients = await db
                .select()
                .from(Client)
                .where(ilike(Client.companyname, `%${name}%`)); // Case-insensitive LIKE search
        }

        if (clients.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No clients found with the specified criteria."
            });
        }

        res.status(200).json({
            success: true,
            data: clients
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            details: error.message
        });
    }
};


// Update a client
export const updateClient = async (req, res) => {
    const { id } = req.params;  // Get client ID from request parameters
    const { companyname, address, contact, email, remarks, status } = req.body;  // Get updated client data from request body

    if (!companyname || !address || !contact || !email) {
        return res.status(400).json(
            {
                message: "All fields are required."

            }
        );
    }

    try {
        // Check if the client exists
        const client = await db.select()
            .from(Client)
            .where(eq(Client.clientid, id));

        if (client.length === 0) {
            return res.status(404).send({
                success: false,
                message: "Client not found."
            });
        }

        // Normalize inputs
        const normalizedCompanyName = companyname?.trim();
        const normalizedAddress = address?.trim();
        const normalizedContact = contact?.trim();
        const normalizedEmail = email?.trim().toLowerCase();  // Trim and lowercase email
        const normalizedRemarks = remarks?.trim() || null;    // Trim remarks or set to null
        const normalizedStatus = status?.trim();

        // Check if there's another client with the same email or contact (excluding the current client)
        const existingClient = await db
            .select()
            .from(Client)
            .where(
                and(
                    ne(Client.clientid, id), // Ensure we are not checking the current client
                    or(eq(Client.email, normalizedEmail), eq(Client.contact, normalizedContact)) // Check for duplicates
                )
            );

        if (existingClient && existingClient.length > 0) {
            return res.status(400).send({
                success: false,
                message: "A client with this email or contact number already exists."
            });
        }

        // Prepare the updated client data
        const updatedClient = {
            companyname: normalizedCompanyName,
            address: normalizedAddress,
            contact: normalizedContact,
            email: normalizedEmail,
            remarks: normalizedRemarks,
            status: normalizedStatus,
        };

        // Perform the update operation on the Client table
        const result = await db
            .update(Client)
            .set(updatedClient)
            .where(eq(Client.clientid, id))
            .returning();

        // If no client is updated (client not found), return a 404 error
        if (result && result.length === 0) {
            return res.status(404).send({
                success: false,
                message: "Client not found."
            });
        }

        // If successful, return the updated client data
        res.status(200).json({
            success: true,
            data: result[0]
        });

    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            details: error.message
        });
    }
};


// Delete a client
export const deleteClient = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.delete(Client)
            .where(eq(Client.clientid, id))
            .returning();

        if (result.length === 0) {
            return res.status(404).send({
                success: false,
                message: "Client not found.",
            });
        }

        // Return 200 with a success message
        res.status(200).json({
            success: true,
            message: "Client deleted successfully.",
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            details: error.message,
        });
    }
};