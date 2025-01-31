import { create } from 'zustand';
import axios from 'axios';

export const useDyeingProcessStore = create((set, get) => ({
    dyeingProcesses: [], // Stores all dyeing process records
    filteredDyeingProcesses: [], // Stores filtered dyeing process records
    searchTerm: '', // Search term for filtering
    searchBy: 'processid', // Field to search by (default: processid)
    loading: false, // Loading state

    // Setter for dyeing processes
    setDyeingProcesses: (dyeingProcesses) => set({ dyeingProcesses }),

    // Setter for filtered dyeing processes
    setFilteredDyeingProcesses: (filteredDyeingProcesses) => set({ filteredDyeingProcesses }),

    // Setter for search term
    setSearchTerm: (searchTerm) => set({ searchTerm }),

    // Setter for searchBy field
    setSearchBy: (searchBy) => set({ searchBy }),

    // Setter for loading state
    setLoading: (loading) => set({ loading }),

    // Create a new dyeing process record
    createDyeingProcess: async (dyeingProcessData) => {
        set({ loading: true });

        // Validate required fields
        const requiredFields = [
            "productdetailid",
            "machineid",
            "batch_qty",
            "grey_weight",
            "finish_weight",
            "finish_after_gsm",
        ];

        const missingFields = requiredFields.filter((field) => !dyeingProcessData[field]);

        if (missingFields.length > 0) {
            set({ loading: false });
            return {
                success: false,
                message: `Missing required fields: ${missingFields.join(", ")}`,
            };
        }

        try {
            const res = await axios.post("/api/dyeing-processes", dyeingProcessData);

            if (res.status >= 200 && res.status < 300) {
                set((state) => ({ dyeingProcesses: [...state.dyeingProcesses, res.data.data] }));
                set({ loading: false });
                return {
                    success: true,
                    message: "Dyeing process created successfully",
                };
            } else {
                set({ loading: false });
                return {
                    success: false,
                    message: "Failed to create dyeing process",
                };
            }
        } catch (error) {
            console.error("Error creating dyeing process:", error);
            set({ loading: false });
            const errorMessage = error.response?.data?.message || "An error occurred while creating the dyeing process.";
            return {
                success: false,
                message: errorMessage,
            };
        }
    },

    // Fetch all dyeing process records
    fetchDyeingProcesses: async () => {
        set({ loading: true });

        try {
            const res = await axios.get("/api/dyeing-processes");

            if (res.status === 200) {
                set({ dyeingProcesses: res.data.data });
            } else {
                throw new Error("Failed to fetch dyeing processes data");
            }
        } catch (error) {
            console.error("Error fetching dyeing processes:", error);
        } finally {
            set({ loading: false });
        }
    },

    // Update a dyeing process record
    updateDyeingProcess: async (id, updatedDyeingProcessData) => {
        set({ loading: true });

        // Validate required fields
        const requiredFields = [
            "productdetailid",
            "machineid",
            "batch_qty",
            "grey_weight",
            "finish_weight",
            "finish_after_gsm",
        ];

        const missingFields = requiredFields.filter((field) => !updatedDyeingProcessData[field]);

        if (missingFields.length > 0) {
            set({ loading: false });
            return {
                success: false,
                message: `Missing required fields: ${missingFields.join(", ")}`,
            };
        }

        try {
            const res = await axios.put(`/api/dyeing-processes/${id}`, updatedDyeingProcessData);

            if (res.status >= 200 && res.status < 300) {
                set((state) => ({
                    dyeingProcesses: state.dyeingProcesses.map((process) => {
                        if (process.processid === id) {
                            return res.data.data;
                        }
                        return process;
                    }),
                }));
                set({ loading: false });
                return {
                    success: true,
                    message: res.data.message || "Dyeing process updated successfully",
                };
            } else {
                set({ loading: false });
                return {
                    success: false,
                    message: "Failed to update dyeing process",
                };
            }
        } catch (error) {
            console.error("Error updating dyeing process:", error);
            set({ loading: false });
            const errorMessage = error.response?.data?.message || "An error occurred while updating the dyeing process.";
            return {
                success: false,
                message: errorMessage,
            };
        }
    },

    // Delete a dyeing process record
    deleteDyeingProcess: async (id) => {
        set({ loading: true });

        try {
            const res = await axios.delete(`/api/dyeing-processes/${id}`);

            if (res.status === 200 || res.status === 204) {
                set((state) => ({
                    dyeingProcesses: state.dyeingProcesses.filter((process) => process.processid !== id),
                }));
                set({ loading: false });
                return { success: true, message: "Dyeing process deleted successfully" };
            } else {
                set({ loading: false });
                return { success: false, message: "Failed to delete dyeing process" };
            }
        } catch (error) {
            console.error("Error deleting dyeing process:", error);
            set({ loading: false });
            const errorMessage = error.response?.data?.message || "An error occurred while deleting the dyeing process.";
            return { success: false, message: errorMessage };
        }
    },

    // Filter dyeing processes based on search term and searchBy field
    filterDyeingProcesses: () => {
        const { dyeingProcesses, searchTerm, searchBy } = get();

        if (!searchTerm) {
            set({ filteredDyeingProcesses: dyeingProcesses });
            return;
        }

        const filtered = dyeingProcesses.filter((process) => {
            const fieldValue = String(process[searchBy]).toLowerCase();
            return fieldValue.includes(searchTerm.toLowerCase());
        });

        set({ filteredDyeingProcesses: filtered });
    },
}));