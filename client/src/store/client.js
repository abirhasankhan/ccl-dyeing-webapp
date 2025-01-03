import { create } from 'zustand';
import axios from 'axios';

export const useClientStore = create((set, get) => ({
    client: [],
    filteredClients: [],
    searchTerm: '',
    searchBy: 'name',
    loading: false, // Add loading state

    setClient: (client) => set({ client }),
    setFilteredClients: (filteredClients) => set({ filteredClients }),
    setSearchTerm: (searchTerm) => set({ searchTerm }),
    setSearchBy: (searchBy) => set({ searchBy }),
    setLoading: (loading) => set({ loading }), // Set loading state

    // Create a new client
    createClient: async (newClient) => {
        set({ loading: true }); // Start loading

        if (!newClient.companyname || !newClient.address || !newClient.contact || !newClient.email) {
            set({ loading: false }); // End loading
            return {
                success: false,
                message: "Please fill in all required fields",
            };
        }

        try {
            const res = await axios.post("/api/client/create", newClient);

            if (res.status === 200 || res.status === 201) {
                set((state) => ({ client: [...state.client, res.data.data] }));
                set({ loading: false }); // End loading
                return {
                    success: true,
                    message: "Client created successfully",
                };
            } else {
                set({ loading: false }); // End loading
                return {
                    success: false,
                    message: "Failed to create client",
                };
            }
        } catch (error) {
            set({ loading: false }); // End loading
            console.error("Error creating client:", error);
            const errorMessage = error.response?.data?.message || "An error occurred while creating the client.";
            return {
                success: false,
                message: errorMessage,
            };
        }
    },

    // Fetch all clients
    fetchClient: async () => {
        set({ loading: true }); // Start loading

        try {
            const res = await axios.get("/api/client/clients");

            if (res.status === 200) {
                set({ client: res.data.data });
            } else {
                throw new Error("Failed to fetch clients data");
            }
        } catch (error) {
            console.error("Error fetching client data:", error);
        } finally {
            set({ loading: false }); // End loading
        }
    },

    // Update an existing client
    updateClient: async (id, updatedClient) => {
        set({ loading: true }); // Start loading

        try {
            const res = await axios.put(`/api/client/update/${id}`, updatedClient);

            if (res.status === 200 || res.status === 201) {
                set((state) => ({
                    client: state.client.map((client) => {
                        if (client.clientid === id) {
                            return { ...client, ...updatedClient };
                        }
                        return client;
                    }),
                }));
                set({ loading: false }); // End loading
                return { success: true, message: "Client updated successfully" };
            } else {
                set({ loading: false }); // End loading
                return { success: false, message: "Failed to update client" };
            }
        } catch (error) {
            set({ loading: false }); // End loading
            console.error("Error updating client:", error);
            return { success: false, message: "An error occurred while updating the client." };
        }
    },

    // Delete an existing client
    deleteClient: async (id) => {
        set({ loading: true }); // Start loading

        try {
            const res = await axios.delete(`/api/client/${id}`);

            if (res.status === 200 || res.status === 201) {
                set((state) => ({
                    client: state.client.filter((client) => client.clientid !== id),
                }));
                set({ loading: false }); // End loading
                return { success: true, message: "Client deleted successfully" };
            } else {
                set({ loading: false }); // End loading
                return { success: false, message: "Failed to delete client" };
            }
        } catch (error) {
            set({ loading: false }); // End loading
            console.error("Error deleting client:", error);
            return { success: false, message: "An error occurred while deleting the client." };
        }
    },

    // Search clients by ID or name
    searchClients: (searchTerm, searchBy) => {
        const { client } = get();
        let filteredClients = [];

        if (searchTerm) {
            if (searchBy === 'name') {
                filteredClients = client.filter(client =>
                    client.companyname.toLowerCase().includes(searchTerm.toLowerCase())
                );
            } else if (searchBy === 'id') {
                filteredClients = client.filter(client =>
                    client.clientid.toString().includes(searchTerm)
                );
            }
        } else {
            filteredClients = client; // Show all clients if search term is empty
        }

        set({ filteredClients });
    },

    // Filter clients based on search criteria
    filterClients: (clients) => {
        const { searchTerm, searchBy } = get();
        let filteredClients = [];

        if (searchTerm) {
            if (searchBy === 'name') {
                filteredClients = clients.filter(client =>
                    client.companyname.toLowerCase().includes(searchTerm.toLowerCase())
                );
            } else if (searchBy === 'id') {
                filteredClients = clients.filter(client =>
                    client.clientid.toString().includes(searchTerm)
                );
            }
        } else {
            filteredClients = clients; // Show all clients if search term is empty
        }

        set({ filteredClients });
    },
}));
