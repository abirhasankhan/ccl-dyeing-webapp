import { create } from 'zustand';
import axios from 'axios';

export const useClientDealStore = create((set, get) => ({
    clientDeals: [],
    filteredClientDeals: [],
    searchTerm: '',
    searchBy: 'deal_id',
    loading: false,
    page: 1, // Add pagination states
    limit: 10,
    totalCount: 0,
    totalPages: 0,

    // Setter for client deals
    setClientDeals: (clientDeals) => set({ clientDeals }),

    // Setter for filtered client deals
    setFilteredClientDeals: (filteredClientDeals) => set({ filteredClientDeals }),

    // Setter for search term
    setSearchTerm: (searchTerm) => set({ searchTerm }),

    // Setter for searchBy field
    setSearchBy: (searchBy) => set({ searchBy }),

    // Setter for loading state
    setLoading: (loading) => set({ loading }),

    // Helper function to format dates
    formatDate: (date) => (date ? new Date(date).toLocaleString() : "N/A"),

    // Create a new client deal
    createClientDeal: async (newClientDeal) => {
        set({ loading: true });

        try {
            const res = await axios.post("/api/client-deals", newClientDeal);

            if (res.status >= 200 && res.status < 300) {
                const dealData = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;

                // Format dates and bankInfo
                const formattedDeal = {
                    ...dealData,
                    issue_date: get().formatDate(dealData.issue_date),
                    valid_through: get().formatDate(dealData.valid_through),
                    created_at: get().formatDate(dealData.created_at),
                    updated_at: get().formatDate(dealData.updated_at),
                    bankInfo: dealData.bankInfo || { bankName: '', branch: '', sortCode: '' },
                };

                // Update the client deals state
                set((state) => ({ clientDeals: [...state.clientDeals, formattedDeal] }));

                return {
                    success: true,
                    message: res.data.message || "Client Deal created successfully",
                    deal_id: dealData.deal_id,
                };
            } else {
                throw new Error(res.data.message || "Failed to create Client Deal");
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || error.message || "An error occurred while creating the Client Deal.";

            return {
                success: false,
                message: errorMessage,
            };
        } finally {
            set({ loading: false });
        }
    },

    // Fetch all client deals
    fetchClientDeals: async (page = 1, limit = 10) => {
        // Start loading
        set({ loading: true });

        try {
            // Pass page and limit as query parameters
            const res = await axios.get("/api/client-deals", { params: { page, limit } });

            // Expecting the API to return an object containing a deals array and pagination metadata
            if (
                res.status === 200 &&
                res.data.data &&
                Array.isArray(res.data.data.deals)
            ) {
                const { deals, totalCount, totalPages } = res.data.data;

                // Format dates and bankInfo for each deal
                const formattedData = deals.map((deal) => ({
                    ...deal,
                    issue_date: get().formatDate(deal.issue_date),
                    valid_through: get().formatDate(deal.valid_through),
                    created_at: get().formatDate(deal.created_at),
                    updated_at: get().formatDate(deal.updated_at),
                    bankInfo: deal.bankInfo || { bankName: "", branch: "", sortCode: "" },
                }));

                // Update the store with the deals and pagination info
                set({
                    clientDeals: formattedData,
                    filteredClientDeals: formattedData,
                    page,
                    limit,
                    totalCount,
                    totalPages,
                });
            } else {
                throw new Error("Failed to fetch client deals. Unexpected response format.");
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                "An error occurred while fetching client deals.";
            return {
                success: false,
                message: errorMessage,
            };
        } finally {
            // End loading
            set({ loading: false });
        }
    },




    // Update a client deal
    updateClientDeal: async (dealId, updatedDeal) => {
        set({ loading: true });

        try {
            const res = await axios.put(`/api/client-deals/${dealId}`, updatedDeal);

            if (res.status >= 200 && res.status < 300) {
                const dealData = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;

                // Format dates and bankInfo
                const formattedDeal = {
                    ...dealData,
                    issue_date: get().formatDate(dealData.issue_date),
                    valid_through: get().formatDate(dealData.valid_through),
                    created_at: get().formatDate(dealData.created_at),
                    updated_at: get().formatDate(dealData.updated_at),
                    bankInfo: dealData.bankInfo || { bankName: '', branch: '', sortCode: '' },
                };

                // Update the client deals state
                set((state) => ({
                    clientDeals: state.clientDeals.map((deal) =>
                        deal.deal_id === dealId ? formattedDeal : deal
                    ),
                }));

                return {
                    success: true,
                    message: res.data.message || "Client Deal updated successfully",
                    deal_id: dealId,
                };
            } else {
                throw new Error(res.data.message || "Failed to update Client Deal");
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "An error occurred while updating the Client Deal.";

            return {
                success: false,
                message: errorMessage,
            };
        } finally {
            set({ loading: false });
        }
    },

    // Delete a client deal
    deleteClientDeal: async (dealId) => {
        set({ loading: true });

        try {
            const res = await axios.delete(`/api/client-deals/${dealId}`);

            if (res.status === 200 || res.status === 204) {
                // Remove the deleted deal from the state
                set((state) => ({
                    clientDeals: state.clientDeals.filter((deal) => deal.deal_id !== dealId),
                }));

                return {
                    success: true,
                    message: "Client Deal deleted successfully",
                };
            } else {
                throw new Error(res.data.message || "Failed to delete Client Deal");
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "An error occurred while deleting the Client Deal.";

            return {
                success: false,
                message: errorMessage,
            };
        } finally {
            set({ loading: false });
        }
    },

    // Search and filter client deals
    searchClientDeals: () => {
        const { clientDeals, searchTerm, searchBy } = get();

        if (!searchTerm) {
            set({ filteredClientDeals: clientDeals });
            return;
        }

        const filtered = clientDeals.filter((deal) => {
            const fieldValue = String(deal[searchBy]).toLowerCase();
            return fieldValue.includes(searchTerm.toLowerCase());
        });

        set({ filteredClientDeals: filtered });
    },
}));