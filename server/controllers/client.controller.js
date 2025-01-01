import { db } from "../config/drizzleSetup.js";
import { Client } from "../models/client.model.js";
import { eq, sql, ilike } from 'drizzle-orm';



// Create a new client
export const createClient = async (req, res) => {
    try {
        const { companyname, address, contact, email, remarks } = req.body;

        // Check for duplicate email or contact
        const existingClient = await db
            .select()
            .from(Client)
            .where((row) => row.email === email || row.contact === contact);

        if (existingClient.length > 0) {
            return res.status(400).json({
                error: "A client with this email or contact number already exists.",
            });
        }

        const newClient = {
            companyname,
            address,
            contact,
            email,
            remarks,
        };

        const result = await db.insert(Client).values(newClient).returning();
        res.status(201).json(result[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all clients
export const getClients = async (req, res) => {
    try {
        const clients = await db.select().from(Client);
        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a client by ID
export const getClientById = async (req, res) => {
    try {
        const { id } = req.params;

        // Corrected query
        const client = await db.select()
            .from(Client)
            .where(eq(Client.clientid, id));

        if (client.length === 0) {
            return res.status(404).json({ error: "Client not found." });
        }

        return res.status(200).json(client[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Update a client
export const updateClient = async (req, res) => {
    try {
        const { id } = req.params;  // Get client ID from request parameters
        const { companyname, address, contact, email, remarks, status } = req.body;  // Get updated client data from request body

        const client = await db.select()
            .from(Client)
            .where(eq(Client.clientid, id));

        if (client.length === 0) {
            return res.status(404).json({ error: "Client not found." });
        }

        // Check if there's another client with the same email or contact (excluding the current client)
        const existingClient = await db
            .select()
            .from(Client)
            .where(
                sql`clientid != ${id}`,  // Ensure we are not checking the current client
                sql`email = ${email}`,    // Check for the same email
                sql`contact = ${contact}` // Check for the same contact
            );

        // If a client with the same email or contact exists, return a 400 error
        if (existingClient && existingClient.length > 0) {
            return res.status(400).json({
                error: "A client with this email or contact number already exists.",
            });
        }

        // Prepare the updated client data
        const updatedClient = {
            companyname,
            address,
            contact,
            email,
            remarks,
            status,
        };

        // Perform the update operation on the Client table
        const result = await db
            .update(Client)  // Specify the table to update
            .set(updatedClient)  // Set the updated values for the client
            .where(eq(Client.clientid, id))
            .returning();  // Return the updated client

        // If no client is updated (client not found), return a 404 error
        if (result && result.length === 0) {
            return res.status(404).json({ error: "Client not found." });
        }

        // If successful, return the updated client data
        res.status(200).json(result[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });  // Catch and return any errors
    }
};


// Delete a client
export const deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.delete(Client)
                                .where(eq(Client.clientid, id))
                                .returning();

        if (result.length === 0) {
            return res.status(404).json({ error: "Client not found." });
        }

        res.status(200).json({ message: "Client deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Search clients by name
export const searchClientsByName = async (req, res) => {
    try {
        const { name } = req.query;

        if (!name) {
            return res.status(400).json({ error: "Name query parameter is required." });
        }

        const clients = await db
            .select()
            .from(Client)
            .where(ilike(Client.companyname, `%${name}%`)); // Case-insensitive LIKE search

        if (clients.length === 0) {
            return res.status(404).json({ error: "No clients found with the specified name." });
        }

        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};