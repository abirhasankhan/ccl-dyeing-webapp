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

    // Create client deal with deal_id handling
    createClientDeal: async (newClientDeal) => {
        set({ loading: true });

        try {
            const res = await axios.post("/api/client-deals", newClientDeal);

            if (res.status >= 200 && res.status < 300) {
                const dealData = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
                const dealId = dealData?.deal_id || dealData?.clientid;

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

            // Enhanced error handling with backend response error
            const errorMessage =
                error.response?.data?.message || error.message || "An error occurred while creating the Client Deal.";

            return {
                success: false,
                message: errorMessage,
            };
        }
    },

    // Fetch client deals
    fetchClientDeals: async () => {
        set({ loading: true });

        try {
            const res = await axios.get("/api/client-deals");

            if (res.status === 200 && Array.isArray(res.data.data)) {
                const formattedData = res.data.data.map((deal) => {
                    console.log('Fetched deal:', deal); // Check the deal object

                    // If bank_info is missing, provide default empty object with structure
                    return {
                        ...deal,
                        bankInfo: deal.bankInfo || { bankName: '', branch: '', sortCode: '' },
                    };
                });

                set({ clientDeals: formattedData });
            } else {
                console.error("Expected data to be an array but got:", res.data.data);
                return {
                    success: false,
                    message: "Failed to fetch client deals. Unexpected response format.",
                };
            }
        } catch (error) {
            console.error("Error fetching client deals:", error);
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



    // Update client deal
    updateClientDeal: async (dealId, updatedDeal) => {
        set({ loading: true });

        try {
            const res = await axios.put(`/api/client-deals/${dealId}`, updatedDeal);

            if (res.status >= 200 && res.status < 300) {
                const dealData = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
                const updatedDealId = dealData?.deal_id || dealData?.clientid;

                set((state) => ({
                    clientDeals: state.clientDeals.map((deal) =>
                        deal.deal_id === dealId ? { ...deal, ...updatedDeal } : deal
                    ),
                }));

                set({ loading: false });
                return {
                    success: true,
                    message: res.data.message || "Client Deal updated successfully",
                    deal_id: updatedDealId,
                };
            } else {
                set({ loading: false });
                return {
                    success: false,
                    message: res.data.message || "Failed to update Client Deal",
                };
            }
        } catch (error) {
            set({ loading: false });
            const errorMessage =
                error.response?.data?.message || "An error occurred while updating the Client Deal.";

            return {
                success: false,
                message: errorMessage,
            };
        }
    },

    // Delete client deal
    deleteClientDeal: async (dealId) => {
        set({ loading: true });

        try {
            const res = await axios.delete(`/api/client-deals/${dealId}`);

            if (res.status === 200 || res.status === 204) {
                set((state) => ({
                    clientDeals: state.clientDeals.filter((deal) => deal.deal_id !== dealId),
                }));

                set({ loading: false });
                return {
                    success: true,
                    message: "Client Deal deleted successfully",
                };
            } else {
                set({ loading: false });
                return {
                    success: false,
                    message: res.data.message || "Failed to delete Client Deal",
                };
            }
        } catch (error) {
            set({ loading: false });
            const errorMessage =
                error.response?.data?.message || "An error occurred while deleting the Client Deal.";

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
                    deal.deal_id.toString().includes(searchTerm) || deal.clientid.toString().includes(searchTerm)
                );
            }
        } else {
            filteredClientDeals = clientDeals;
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
                    deal.deal_id.toString().includes(searchTerm) || deal.clientid.toString().includes(searchTerm)
                );
            }
        } else {
            filteredClientDeals = clientDeals;
        }

        set({ filteredClientDeals });
    },
}));
