import { create } from 'zustand';
import axios from 'axios';

export const useAdditionalProcessDealsStore = create((set, get) => ({

    additionalProcessDeals: [],
    filteredAdditionalProcessDeals: [],
    searchTerm: '',
    searchBy: 'name',
    loading: false, // Add loading state

    setAdditionalProcessDeals: (additionalProcessDeals) => set({ additionalProcessDeals }),

    setFilteredAdditionalProcessDeals: (filteredAdditionalProcessDeals) => set({ filteredAdditionalProcessDeals }),

    setSearchTerm: (searchTerm) => set({ searchTerm }),

    setSearchBy: (searchBy) => set({ searchBy }),

    setLoading: (loading) => set({ loading }),

    // Create a new AdditionalProcessDeal
    createAdditionalProcessDeal: async (newAdditionalProcessDeal) => {

        set({ loading: true }); // Start loading

        try {
            const res = await axios.post("/api/additional-process-deals", newAdditionalProcessDeal);

            if (res.status >= 200 && res.status < 300) {
                set((state) => ({ additionalProcessDeals: [...state.additionalProcessDeals, res.data.data] })); // Add the new deal to the state
                set({ loading: false }); // End loading
                return {
                    success: true,
                    message: res.data.message || "Additional Process Deal created successfully",
                };
            } else {
                throw new Error(res.data.message || "Failed to create Additional Process Deal");
            }
        } catch (error) {
            set({ loading: false }); // End loading

            console.error("Error creating Additional Process Deal:", error);
            const errorMessage = error.response?.data?.message || "An error occurred while creating the Additional Process Deal.";
            return {
                success: false,
                message: errorMessage,
            }
        }
    },

    // Fetch additional process deals
    fetchAdditionalProcessDeals: async () => {
        set({ loading: true }); // Start loading

        try {
            const res = await axios.get("/api/additional-process-deals");

            if (res.status === 200) {
                set({ additionalProcessDeals: res.data.data });
            } else {
                throw new Error(res.data.message || "Failed to fetch additional process deals");
            }
        } catch (error) {
            set({ loading: false }); // End loading
            console.error("Error fetching additional process deals:", error);

            const errorMessage = error.response?.data?.message || "An error occurred while fetching additional process deals.";
            return {
                success: false,
                message: errorMessage,
            };
        } finally {
            set({ loading: false }); // End loading
        }
    },

    // Update an additional process deal
    updateAdditionalProcessDeal: async (dealId, updatedDeal) => {
        set({ loading: true }); // Start loading

        try {
            const res = await axios.put(`/api/additional-process-deals/${dealId}`, updatedDeal);

            if (res.status >= 200 && res.status < 300) {
                set((state) => ({
                    additionalProcessDeals: state.additionalProcessDeals.map((deal) => {
                        if (deal.deal_id === dealId) {
                            return res.data.data;
                        }
                        return deal;
                    }),
                }));
                set({ loading: false }); // End loading
                return {
                    success: true,
                    message: res.data.message || "Additional Process Deal updated successfully",
                };
            } else {
                throw new Error(res.data.message || "Failed to update Additional Process Deal");
            }
        } catch (error) {
            set({ loading: false }); // End loading
            console.error("Error updating Additional Process Deal:", error);
            const errorMessage = error.response?.data?.message || "An error occurred while updating the Additional Process Deal.";
            return {
                success: false,
                message: errorMessage,
            }
        }
    },

    // Delete an additional process deal
    deleteAdditionalProcessDeal: async (dealId) => {
        set({ loading: true }); // Start loading

        try {
            const res = await axios.delete(`/api/additional-process-deals/${dealId}`);

            if (res.status === 200 || res.status === 204) {
                set((state) => ({
                    additionalProcessDeals: state.additionalProcessDeals.filter((deal) => deal.deal_id !== dealId),
                }));
                set({ loading: false }); // End loading
                return {
                    success: true,
                    message: res.data.message || "Additional Process Deal deleted successfully",
                };
            } else {
                set({ loading: false }); // End loading
                throw new Error(res.data.message || "Failed to delete Additional Process Deal");

            }
        } catch (error) {
            set({ loading: false }); // End loading
            console.error("Error deleting Additional Process Deal:", error);
            const errorMessage = error.response?.data?.message || "An error occurred while deleting the Additional Process Deal.";
            return {
                success: false,
                message: errorMessage,
            }
        }
    },

    
}))