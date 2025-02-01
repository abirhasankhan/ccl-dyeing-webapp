import { create } from "zustand";
import axios from "axios";

export const useStoreStore = create((set, get) => ({
    
    stores: [], // Stores all store records
    filteredStores: [], // Stores filtered store records
    searchTerm: "", // Search term for filtering
    searchBy: "storeid", // Field to search by (default: storeid)
    loading: false, // Loading state

    // Setter for stores
    setStores: (stores) => set({ stores }),

    // Setter for filtered stores
    setFilteredStores: (filteredStores) => set({ filteredStores }),

    // Setter for search term
    setSearchTerm: (searchTerm) => set({ searchTerm }),

    // Setter for searchBy field
    setSearchBy: (searchBy) => set({ searchBy }),

    // Setter for loading state
    setLoading: (loading) => set({ loading }),

    // Create a new store record
    createStore: async (storeData) => {
        set({ loading: true });

        // Validate required fields
        const requiredFields = ["processid", "product_location", "qty"];
        const missingFields = requiredFields.filter((field) => !storeData[field]);

        if (missingFields.length > 0) {
            set({ loading: false });
            return {
                success: false,
                message: `Missing required fields: ${missingFields.join(", ")}`,
            };
        }

        try {
            const res = await axios.post("/api/stores", storeData);

            if (res.status >= 200 && res.status < 300) {
                set((state) => ({ stores: [...state.stores, res.data.data] }));
                set({ loading: false });
                return {
                    success: true,
                    message: "Store record created successfully",
                };
            } else {
                set({ loading: false });
                return {
                    success: false,
                    message: "Failed to create store record",
                };
            }
        } catch (error) {
            console.error("Error creating store record:", error);
            set({ loading: false });
            const errorMessage =
                error.response?.data?.message || "An error occurred while creating the store record.";
            return {
                success: false,
                message: errorMessage,
            };
        }
    },

    // Fetch all store records
    fetchStores: async () => {
        set({ loading: true });

        try {
            const res = await axios.get("/api/stores");

            if (res.status === 200) {
                set({ stores: res.data.data });
            } else {
                throw new Error("Failed to fetch store records");
            }
        } catch (error) {
            console.error("Error fetching store records:", error);
        } finally {
            set({ loading: false });
        }
    },

    // Update a store record
    updateStore: async (id, updatedStoreData) => {
        set({ loading: true });

        // Validate required fields
        const requiredFields = ["processid", "product_location", "qty"];
        const missingFields = requiredFields.filter((field) => !updatedStoreData[field]);

        if (missingFields.length > 0) {
            set({ loading: false });
            return {
                success: false,
                message: `Missing required fields: ${missingFields.join(", ")}`,
            };
        }

        try {
            const res = await axios.put(`/api/stores/${id}`, updatedStoreData);

            if (res.status >= 200 && res.status < 300) {
                set((state) => ({
                    stores: state.stores.map((store) => {
                        if (store.storeid === id) {
                            return res.data.data;
                        }
                        return store;
                    }),
                }));
                set({ loading: false });
                return {
                    success: true,
                    message: res.data.message || "Store record updated successfully",
                };
            } else {
                set({ loading: false });
                return {
                    success: false,
                    message: "Failed to update store record",
                };
            }
        } catch (error) {
            console.error("Error updating store record:", error);
            set({ loading: false });
            const errorMessage =
                error.response?.data?.message || "An error occurred while updating the store record.";
            return {
                success: false,
                message: errorMessage,
            };
        }
    },

    // Delete a store record
    deleteStore: async (id) => {
        set({ loading: true });

        try {
            const res = await axios.delete(`/api/stores/${id}`);

            if (res.status === 200 || res.status === 204) {
                set((state) => ({
                    stores: state.stores.filter((store) => store.storeid !== id),
                }));
                set({ loading: false });
                return { success: true, message: "Store record deleted successfully" };
            } else {
                set({ loading: false });
                return { success: false, message: "Failed to delete store record" };
            }
        } catch (error) {
            console.error("Error deleting store record:", error);
            set({ loading: false });
            const errorMessage =
                error.response?.data?.message || "An error occurred while deleting the store record.";
            return { success: false, message: errorMessage };
        }
    },

    // Filter store records based on search term and searchBy field
    filterStores: () => {
        const { stores, searchTerm, searchBy } = get();

        if (!searchTerm) {
            set({ filteredStores: stores });
            return;
        }

        const filtered = stores.filter((store) => {
            const fieldValue = String(store[searchBy]).toLowerCase();
            return fieldValue.includes(searchTerm.toLowerCase());
        });

        set({ filteredStores: filtered });
    },
}));