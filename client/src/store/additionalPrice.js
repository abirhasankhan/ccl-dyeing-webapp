import { create } from 'zustand';
import axios from 'axios';

export const useAdditionalPriceStore = create((set, get) => ({

    additionalPrices: [],
    filteredAdditionalPrices: [],
    loading: false, // Add loading state

    setLoading: (loading) => set({ loading }),
    setAdditionalPrices: (additionalPrices) => set({ additionalPrices }),

    //create additional price
    createAdditionalPrice: async (newAdditionalPrice) => {

        set({ loading: true }); // Start loading

        if (!newAdditionalPrice.price || !newAdditionalPrice.process_type) {

            set({ loading: false }); // End loading
            return {
                success: false,
                message: "Please fill in all required fields",
            };
        }

        try {
            const res = await axios.post("/api/additional-prices/create", newAdditionalPrice);

            if (res.status === 200 || res.status === 201) {
                set((state) => ({ additionalPrices: [...state.additionalPrices, res.data.data] }));
                set({ loading: false }); // End loading
                return { 
                    success: true, 
                    message: "Additional Price created successfully" 
                };
            } else {
                set({ loading: false }); // End loading
                return { 
                    success: false, 
                    message: "Failed to create Additional Price" 
                };
            }
        } catch (error) {
            set({ loading: false }); // End loading
            console.error("Error creating Additional Price:", error);
            const errorMessage = error.response?.data?.message || "An error occurred while creating the Additional Price.";

            return {
                success: false,
                message: errorMessage,
            };
        }
    },

    // Fetch additional prices
    fetchAdditionalPrices: async () => {
        set({ loading: true }); // Start loading

        try {
            const res = await axios.get("/api/additional-prices");

            if (res.status === 200) {
                set({ additionalPrices: res.data.data });
            } else {
                set({ loading: false }); // End loading
                return {
                    success: false,
                    message: "Failed to create Additional Price"
                };
            }
        } catch (error) {
            set({ loading: false }); // End loading
            console.error("Error creating Additional Price:", error);
            const errorMessage = error.response?.data?.message || "An error occurred while creating the Additional Price.";

            return {
                success: false,
                message: errorMessage,
            };
        } finally {
            set({ loading: false }); // End loading
        }
    },

    // Update additional price
    updateAdditionalPrice: async (id, updatedAdditionalPrice) => {

        set({ loading: true }); // Start loading

        try {
            const res = await axios.put(`/api/additional-prices/${id}`, updatedAdditionalPrice);

            if (res.status === 200 || res.status === 201) {
                set((state) => ({
                    additionalPrices: state.additionalPrices.map((additionalPrice) => {
                        if (additionalPrice._id === id) {
                            return { ...additionalPrice, ...updatedAdditionalPrice };
                        }
                        return additionalPrice;
                    }),
                }));
                set({ loading: false }); // End loading
                return { success: true, message: "Additional Price updated successfully" };
            } else {
                set({ loading: false }); // End loading
                return { success: false, message: "Failed to update Additional Price" };
            }
        } catch (error) {
            set({ loading: false }); // End loading
            console.error("Error updating Additional Price:", error);
            const errorMessage = error.response?.data?.message || "An error occurred while updating the Additional Price.";

            return {
                success: false,
                message: errorMessage,
            };
        }
    },

    // Delete additional price
    deleteAdditionalPrice: async (id) => {
        set({ loading: true }); // Start loading

        try {
            const res = await axios.delete(`/api/additional-prices/${id}`);

            if (res.status === 200 || res.status === 201) {
                set((state) => ({
                    additionalPrices: state.additionalPrices.filter((additionalPrice) => additionalPrice._id !== id),
                }));
                set({ loading: false }); // End loading
                return { success: true, message: "Additional Price deleted successfully" };
            } else {
                set({ loading: false }); // End loading
                return { success: false, message: "Failed to delete Additional Price" };
            }
        } catch (error) {
            set({ loading: false }); // End loading
            console.error("Error deleting Additional Price:", error);
            const errorMessage = error.response?.data?.message || "An error occurred while deleting the Additional Price.";

            return {    
                success: false,
                message: errorMessage,
            };
        }
    },


}));