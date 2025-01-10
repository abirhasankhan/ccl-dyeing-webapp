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
        set({ loading: true });

        try {
            const res = await axios.get("/api/dyeing-finishing-prices");

            if(res.status === 200) {
                set({ dyeingPrices: res.data.data});
            } else {
                throw new Error("Faild to fetch data")
            }

        } catch (error) {
            console.error("Error fetching client data:", error);
        } finally {
            set({ loading: false });
        }
    },


    // Update Dyeing Price
    updateDyeingPrice: async (id, updatedDyeingPrice) => {
        set({ loading: true }); // Start loading

        try {
            const res = await axios.put(`/api/dyeing-finishing-prices/${id}`, updatedDyeingPrice);

            if (res.status === 200 || res.status === 201) {
                set((state) => ({
                    dyeingPrices: state.dyeingPrices.map((dyeingPrice) =>
                        dyeingPrice.id === id ? { ...dyeingPrice, ...updatedDyeingPrice } : dyeingPrice
                    ),
                }));
                return { success: true, message: "Dyeing Price updated successfully" };
            }
            throw new Error("Failed to update Dyeing Price");

        } catch (error) {
            const errorMessage = error.response?.data?.message || "An error occurred while updating the Dyeing Price.";
            console.error("Error updating Dyeing Price:", errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            set({ loading: false }); // Ensure loading state is cleared
        }
    },


    // Delete Dyeing Price
    deleteDyeingPrice: async (id) => {
        if (!id) {
            console.error("ID is undefined or invalid");
            return { success: false, message: "Invalid Dyeing Price ID" };
        }

        set({ loading: true });

        try {
            const res = await axios.delete(`/api/dyeing-finishing-prices/${id}`);

            if (res.status === 200 || res.status === 201) {
                set((state) => ({
                    dyeingPrices: state.dyeingPrices.filter((dyeingPrice) => dyeingPrice.df_priceid !== id)
                }));
                return { success: true, message: "Dyeing Price deleted successfully" };
            } else {
                throw new Error("Failed to delete Dyeing Price");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "An error occurred while deleting the Dyeing Price.";
            console.error(`Error deleting Dyeing Price with ID ${id}:`, errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            set({ loading: false });
        }
    },

}));