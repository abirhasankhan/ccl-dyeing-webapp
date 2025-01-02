import {create} from 'zustand';
import axios from 'axios';

export const useClientStore = create((set) => ({

    client: [],
    setClient: (client) => set({client}),

    // Create a new client
    createClient: async (newClient) => {

        if (!newClient.companyname || !newClient.address || !newClient.contact || !newClient.email) {
            return {
                success: false,
                message: "Please fill in all required fields",
            };
        }

        try {
            // Send POST request using axios, no need to specify Content-Type header
            const res = await axios.post("/api/client/create", newClient);

            // Check for successful creation, considering the status code might be 201 (Created)
            if (res.status === 200 || res.status === 201) {
                set((state) => ({ client: [...state.client, res.data.data] }));
                return {
                    success: true,
                    message: "Client created successfully",
                };
            } else {
                return {
                    success: false,
                    message: "Failed to create client",
                };
            }
        } catch (error) {
            console.error("Error creating client:", error);
            // Check if the error response has a message from the server
            const errorMessage = error.response?.data?.message || "An error occurred while creating the client.";
            return {
                success: false,
                message: errorMessage,
            };
        }
    },

    // Fetch all clients
    fetchClient: async () => {
        try {
            // Send GET request to fetch client data using axios
            const res = await axios.get("/api/client/clients");

            // Check if the response is successful (status 200)
            if (res.status === 200) {
                // Update the state with the fetched client data
                set({ client: res.data.data });
            } else {
                throw new Error("Failed to fetch clients data");
            }
        } catch (error) {
            console.error("Error fetching client data:", error);
            // Handle error (e.g., set error state or show a notification)
        }
    },

    // Update an existing client
    updateClient: async (id, updatedClient) => {

        try {
            const res = await axios.put(`/api/client/update/${id}`, updatedClient);

            if (res.status === 200 || res.status === 201) {
                set((state) => ({
                    client: state.client.map((client) => {
                        if (client.clientid === id) {
                            return { ...client, ...updatedClient };  // Merge existing client data with updated data
                        }
                        return client;
                    }),
                }));
                return { success: true, message: "Client updated successfully" };
            } else {
                return { success: false, message: "Failed to update client" };
            }
        } catch (error) {
            console.error("Error updating client:", error);
            return { success: false, message: "An error occurred while updating the client." };
        }
    },

    // Delete an existing client
    deleteClient: async (id) => {
        try {
            const res = await axios.delete(`/api/client/${id}`);

            if (res.status === 200 || res.status === 201) {
                set((state) => ({
                    client: state.client.filter((client) => client.clientid !== id),
                }));
                return { success: true, message: "Client deleted successfully" };
            } else {
                return { success: false, message: "Failed to delete client" };
            }
        } catch (error) {
            console.error("Error deleting client:", error);
            return { success: false, message: "An error occurred while deleting the client." };
        }
    },





}));