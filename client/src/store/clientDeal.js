import { create } from 'zustand';
import axios from 'axios';

export const useClientDealStore = create((set, get) => ({

    clientDeals: [],
    filteredClientDeals: [],
    loading: false,

    setLoading: (loading) => set({ loading }),
    setClientDeals: (clientDeals) => set({ clientDeals }),

    // create client deal with deal_id handling
    createClientDeal: async (newClientDeal) => {

        set({ loading: true });

        try {
            const res = await axios.post("/api/client-deals", newClientDeal);

            if (res.status === 200 || res.status === 201) {

                const dealData = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
                const dealId = dealData.deal_id || dealData.clientid;  // Adjust based on actual structure

                set((state) => ({ clientDeals: [...state.clientDeals, dealData] }));
                set({ loading: false });


                return {
                    success: true,
                    message: "Client Deal created successfully",
                    deal_id: dealId,
                };
            } else {
                set({ loading: false });
                return {
                    success: false,
                    message: "Failed to create Client Deal",
                };
            }
        } catch (error) {
            set({ loading: false });
            console.error("Error creating Client Deal:", error);
            const errorMessage = error.response?.data?.message || "An error occurred while creating the Client Deal.";
            return {
                success: false,
                message: errorMessage,
            };
        }
    }

}));
