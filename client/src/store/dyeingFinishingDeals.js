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

}));