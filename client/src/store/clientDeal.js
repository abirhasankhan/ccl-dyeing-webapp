import { create } from 'zustand';
import axios from 'axios';

export const useClientDealStore = create((set, get) => ({

    clientDeals: [],
    filteredClientDeals: [],
    searchTerm: '',
    searchBy: 'name',
    loading: false,

    setClientDeals: (clientDeals) => set({ clientDeals }),
    setFilteredClientDeals: (filteredClientDeals) => set({ filteredClientDeals }),
    setSearchTerm: (searchTerm) => set({ searchTerm }),
    setSearchBy: (searchBy) => set({ searchBy }),
    setLoading: (loading) => set({ loading }),

    // create client deal with deal_id handling
    createClientDeal: async (newClientDeal) => {
        set({ loading: true });

        try {
            const res = await axios.post("/api/client-deals", newClientDeal);

            // Check for successful response
            if (res.status >= 200 && res.status < 300) {
                const dealData = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
                const dealId = dealData?.deal_id || dealData?.clientid;  // Defensive access with optional chaining

                // Update the client deals state
                set((state) => ({ clientDeals: [...state.clientDeals, dealData], loading: false }));

                return {
                    success: true,
                    message: res.data.message || "Client Deal created successfully",
                    deal_id: dealId,
                };
            } else {
                throw new Error(res.data.message || "Failed to create Client Deal");
            }
        } catch (error) {
            set({ loading: false });

            // Improved error logging and extraction
            console.error("Error creating Client Deal:", error);

            // Capture error from backend response
            const errorMessage =
                error.response?.data?.message || error.message || "An error occurred while creating the Client Deal.";

            return {
                success: false,
                message: errorMessage,  // Display the error message from the backend
            };
        }
    },

    // Fetch client deals
    fetchClientDeals: async () => {
        set({ loading: true });

        try {
            const res = await axios.get("/api/client-deals");

            // Check if the request was successful
            if (res.status === 200) {
                set({ clientDeals: res.data.data });
                // return {
                //     success: true,
                //     message: "Client deals fetched successfully",
                // };
            } else {
                return {
                    success: false,
                    message: "Failed to fetch client deals",
                };
            }
        } catch (error) {
            console.error("Error fetching client deals:", error);

            // Handling error response gracefully
            const errorMessage = error.response?.data?.message || "An error occurred while fetching client deals.";

            return {
                success: false,
                message: errorMessage,
            };
        } finally {
            set({ loading: false }); // End loading regardless of success or failure
        }
    },

    // Update client deals
    updateClientDeal: async (dealId, updatedDeal) => {
        set({ loading: true }); // Start loading

        try {
            const res = await axios.put(`/api/client-deals/${dealId}`, updatedDeal);

            // Check for successful response (200 or 201 status)
            if (res.status >= 200 && res.status < 300) {

                // Assuming the response data contains the updated deal
                const dealData = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
                const updatedDealId = dealData?.deal_id || dealData?.clientid;  // Defensive access with optional chaining

                // Update the client deals state
                set((state) => ({
                    clientDeals: state.clientDeals.map((deal) => {
                        if (deal.deal_id === dealId) {
                            return { ...deal, ...updatedDeal };
                        }
                        return deal;
                    }),
                }));

                set({ loading: false }); // End loading
                return {
                    success: true,
                    message: res.data.message || "Client Deal updated successfully",
                    deal_id: updatedDealId,
                };
            } else {
                set({ loading: false }); // End loading
                return {
                    success: false,
                    message: res.data.message || "Failed to update Client Deal",
                };
            }
        } catch (error) {
            set({ loading: false }); // End loading
            console.error("Error updating Client Deal:", error);
            const errorMessage = error.response?.data?.message || "An error occurred while updating the Client Deal.";

            return {
                success: false,
                message: errorMessage,
            };
        }
    },

    // Delete client deals
    deleteClientDeal: async (dealId) => {
        set({ loading: true }); // Start loading

        try {
            const res = await axios.delete(`/api/client-deals/${dealId}`);

            // Check for successful response (200 or 204 status)
            if (res.status === 200 || res.status === 204) {

                // Remove the deleted deal from the state
                set((state) => ({
                    clientDeals: state.clientDeals.filter((deal) => deal.deal_id !== dealId),
                }));

                set({ loading: false }); // End loading
                return {
                    success: true,
                    message: "Client Deal deleted successfully",
                };
            } else {
                set({ loading: false }); // End loading
                return {
                    success: false,
                    message: res.data.message || "Failed to delete Client Deal",
                };
            }
        } catch (error) {
            set({ loading: false }); // End loading
            console.error("Error deleting Client Deal:", error);
            const errorMessage = error.response?.data?.message || "An error occurred while deleting the Client Deal.";

            return {
                success: false,
                message: errorMessage,
            };
        }
    },

    // Search client deals by ID or name
    searchClientDeals: (searchTerm, searchBy) => {
        const { clientDeals } = get();
        let filteredClientDeals = [];

        if (searchTerm) {
            if (searchBy === 'name') {
                filteredClientDeals = clientDeals.filter(deal =>
                    deal.deal_name.toLowerCase().includes(searchTerm.toLowerCase())
                );
            } else if (searchBy === 'id') {
                filteredClientDeals = clientDeals.filter(deal =>
                    deal.deal_id.toString().includes(searchTerm)
                );
            }
        } else {
            filteredClientDeals = clientDeals; // Show all deals if search term is empty
        }

        set({ filteredClientDeals });
    },

    // Filter client deals based on search criteria
    filterClientDeals: (clientDeals) => {
        const { searchTerm, searchBy } = get();
        let filteredClientDeals = [];

        if (searchTerm) {
            if (searchBy === 'name') {
                filteredClientDeals = clientDeals.filter(deal =>
                    deal.deal_name.toLowerCase().includes(searchTerm.toLowerCase())
                );
            } else if (searchBy === 'id') {
                filteredClientDeals = clientDeals.filter(deal =>
                    deal.deal_id.toString().includes(searchTerm)
                );
            }
        } else {
            filteredClientDeals = clientDeals; // Show all deals if search term is empty
        }

        set({ filteredClientDeals });
    },


}));
