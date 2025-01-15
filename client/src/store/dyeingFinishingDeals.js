import { create } from 'zustand';
import axios from 'axios';

export const useDyeingFinishingDealsStore = create((set, get) => ({

    dyeingFinishingDeals: [],
    filteredDyeingFinishingDeals: [],
    searchTerm: '',
    searchBy: 'name',
    loading: false, // Add loading state 

    setDyeingFinishingDeals: (dyeingFinishingDeals) => set({ dyeingFinishingDeals }),

    setFilteredDyeingFinishingDeals: (filteredDyeingFinishingDeals) => set({ filteredDyeingFinishingDeals }),

    setSearchTerm: (searchTerm) => set({ searchTerm }),

    setSearchBy: (searchBy) => set({ searchBy }),

    setLoading: (loading) => set({ loading }),

    // Create a new dyeing finishing deal
    createDyeingFinishingDeal: async (newDyeingFinishingDeal) => {

        set({ loading: true }); // Start loading

        try {
            const res = await axios.post("/api/dyeing-finishing-deals", newDyeingFinishingDeal);

            if (res.status === 200 || res.status === 201) {
                set((state) => ({ dyeingFinishingDeals: [...state.dyeingFinishingDeals, res.data.data] }));
                set({ loading: false }); // End loading
                return {
                    success: true,
                    message: "Dyeing Finishing Deal created successfully",
                };
            } else {
                set({ loading: false }); // End loading
                return {
                    success: false,
                    message: "Failed to create Dyeing Finishing Deal",
                };
            }
        } catch (error) {
            console.error("Error creating Dyeing Finishing Deal:", error);
            set({ loading: false }); // End loading
            return {
                success: false,
                message: "Failed to create Dyeing Finishing Deal",
            };
        }
    },

    // Fetch dyeing finishing deals
    fetchDyeingFinishingDeals: async () => {
        set({ loading: true }); // Start loading

        try {
            const res = await axios.get("/api/dyeing-finishing-deals");

            if (res.status === 200) {
                set({ dyeingFinishingDeals: res.data.data });
            } else {
                throw new Error(res.data.message || "Failed to fetch Dyeing Finishing Deals");
            }
        } catch (error) {
            set({ loading: false }); // End loading

            console.error("Error fetching Dyeing Finishing Deals:", error);
            set({ loading: false }); // End loading

            const errorMessage = error.response?.data?.message || "An error occurred while fetching Dyeing Finishing Deals.";
            return {
                success: false,
                message: errorMessage,
            };
        } finally {
            set({ loading: false }); // End loading
        }
    },

    // Update an dyeing finishing deal
    updateDyeingFinishingDeals: async (dealId, updatedDeal) => {
        set({ loading: true }); // Start loading

        try {
            const res = await axios.put(`/api/dyeing-finishing-deals/${dealId}`, updatedDeal);

            if (res.status >= 200 && res.status < 300) {
                set((state) => ({
                    dyeingFinishingDeals: state.dyeingFinishingDeals.map((deal) => {
                        if (deal.deal_id === dealId) {
                            return res.data.data;
                        }
                        return deal;
                    }),
                }));
                set({ loading: false }); // End loading
                return {
                    success: true,
                    message: res.data.message || "Dyeing Finishing Deals updated successfully",
                };
            } else {
                throw new Error(res.data.message || "Failed to update Dyeing Finishing Deals");
            }
        } catch (error) {
            set({ loading: false }); // End loading
            console.error("Error updating Dyeing Finishing Deals:", error);
            const errorMessage = error.response?.data?.message || "An error occurred while updating the Dyeing Finishing Deals.";
            return {
                success: false,
                message: errorMessage,
            }
        }
    },


    // Delete a dyeing finishing deal
    deleteDyeingFinishingDeal: async (dealId) => {
        set({ loading: true }); // Start loading

        try {
            const res = await axios.delete(`/api/dyeing-finishing-deals/${dealId}`);

            if (res.status === 200 || res.status === 204) {
                set((state) => ({
                    dyeingFinishingDeals: state.dyeingFinishingDeals.filter((deal) => deal.deal_id !== dealId),
                }));
                set({ loading: false }); // End loading
                return {
                    success: true,
                    message: res.data.message || "Dyeing Finishing Deals deleted successfully",
                };
            } else {
                set({ loading: false }); // End loading
                throw new Error(res.data.message || "Failed to delete Dyeing Finishing Deals");
            }
            
        } catch (error) {
            set({ loading: false }); // End loading
            console.error("Error deleting Dyeing Finishing Deals:", error);
            const errorMessage = error.response?.data?.message || "An error occurred while deleting the Dyeing Finishing Deals.";
            return {
                success: false,
                message: errorMessage,
            }
            
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