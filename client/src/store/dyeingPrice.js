import { create } from 'zustand';
import axios from 'axios';

export const useDyeingPriceStore = create((set, get) => ({

    dyeingPrices: [],
    filteredDyeingPrices: [],
    loading: false, // Add loading state

    setLoading: (loading) => set({ loading }),
    setDyeingPrices: (dyeingPrices) => set({ dyeingPrices }),

    // Create Dyeing Price
    createDyeingPrice: async (newDyeingPrice) => {

        set({ loading: true }); // Start loading

        if (!newDyeingPrice.color || !newDyeingPrice.tube_tk || !newDyeingPrice.open_tk || !newDyeingPrice.elasteen_tk) {

            set({ loading: false }); // End loading
            return {
                success: false,
                message: "Please fill in all required fields",
            };
        }

        try {
            const res = await axios.post("/api/dyeing-finishing-prices/create", newDyeingPrice);

            if (res.status === 200 || res.status === 201) {
                set((state) => ({ dyeingPrices: [...state.dyeingPrices, res.data.data] }));
                set({ loading: false }); // End loading
                return {
                    success: true,
                    message: "Dyeing Price created successfully",
                };
            } else {
                set({ loading: false }); // End loading
                return {
                    success: false,
                    message: "Failed to add Dyeing Price",
                };
            }
        } catch (error) {
            set({ loading: false }); // End loading
            console.error("Error creating Dyeing Price:", error);
            const errorMessage = error.response?.data?.message || "An error occurred while creating the Dyeing Price.";

            return {
                success: false,
                message: errorMessage,
            };
        }
    },

    // Fetch Dyeing Price
    fetchDyeingPrice: async () => {
        set({ loading: true }); // Start loading

        try {
            const res = await axios.get("/api/dyeing-finishing-prices");

            if (res.status === 200) {
                set({ dyeingPrices: res.data.data });
            } else {
                throw new Error("Failed to fetch Dyeing Price data");
            }
        } catch (error) {
            console.error("Error fetching Dyeing Price data:", error);
        } finally {
            set({ loading: false }); // End loading
        }
    },

    // Update Dyeing Price
    updateDyeingPrice: async (id, updatedDyeingPrice) => {

        set({ loading: true }); // Start loading

        try {
            const res = await axios.put(`/api/dyeing-finishing-prices/${id}`, updatedDyeingPrice);

            if (res.status === 200 || res.status === 201) {
                set((state) => ({
                    dyeingPrices: state.dyeingPrices.map((dyeingPrice) => {
                        if (dyeingPrice.id === id) {
                            return { ...dyeingPrice, ...updatedDyeingPrice };
                        }
                        return dyeingPrice;
                    }),
                }));
                set({ loading: false }); // End loading
                return { success: true, message: "Dyeing Price updated successfully" };
            } else {
                set({ loading: false }); // End loading
                return { success: false, message: "Failed to update Dyeing Price" };
            }
        } catch (error) {
            set({ loading: false }); // End loading
            console.error("Error updating Dyeing Price:", error);
            const errorMessage = error.response?.data?.message || "An error occurred while updating the Dyeing Price.";

            return { 
                success: false, 
                message: errorMessage,
            };
        }
    },

    // Delete Dyeing Price
    deleteDyeingPrice: async (id) => {
        set({ loading: true }); // Start loading

        try {
            const res = await axios.delete(`/api/dyeing-finishing-prices/${id}`);

            if (res.status === 200 || res.status === 201) {
                set((state) => ({ 
                    dyeingPrices: state.dyeingPrices.filter((dyeingPrice) => dyeingPrice.id !== id) 
                }));
                set({ loading: false }); // End loading 
                return { success: true, message: "Dyeing Price deleted successfully" };
            } else {
                set({ loading: false }); // End loading 
                return { success: false, message: "Failed to delete Dyeing Price" };
            }
        } catch (error) {
            set({ loading: false }); // End loading 
            console.error("Error deleting Dyeing Price:", error);
            return { success: false, message: "An error occurred while deleting the Dyeing Price." };
        }
    }


}))