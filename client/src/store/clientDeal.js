import { create } from 'zustand';
import axios from 'axios';

export const useClientDealStore = create((set, get) => ({
    clientDeals: [], // Stores all client deals
    filteredClientDeals: [], // Stores filtered client deals
    searchTerm: '', // Search term for filtering
    searchBy: 'deal_id', // Field to search by (default: deal_id)
    loading: false, // Loading state

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
    fetchClientDeals: async () => {
        set({ loading: true });

        try {
            const res = await axios.get("/api/client-deals");

            if (res.status === 200 && Array.isArray(res.data.data)) {
                // Format dates and bankInfo
                const formattedData = res.data.data.map((deal) => ({
                    ...deal,
                    issue_date: get().formatDate(deal.issue_date),
                    valid_through: get().formatDate(deal.valid_through),
                    created_at: get().formatDate(deal.created_at),
                    updated_at: get().formatDate(deal.updated_at),
                    bankInfo: deal.bankInfo || { bankName: '', branch: '', sortCode: '' },
                }));

                set({ clientDeals: formattedData, filteredClientDeals: formattedData });
            } else {
                throw new Error("Failed to fetch client deals. Unexpected response format.");
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "An error occurred while fetching client deals.";

            return {
                success: false,
                message: errorMessage,
            };
        } finally {
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