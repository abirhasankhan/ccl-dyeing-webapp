import { create } from 'zustand';
import axios from 'axios';

export const useMachineStore = create((set, get) => ({

    machines: [], // Stores all machine records
    filteredMachines: [], // Stores filtered machine records
    searchTerm: '', // Search term for filtering
    searchBy: 'machine_name', // Field to search by (default: machine_name)
    loading: false, // Loading state

    // Setter for machines
    setMachines: (machines) => set({ machines }),

    // Setter for filtered machines
    setFilteredMachines: (filteredMachines) => set({ filteredMachines }),

    // Setter for search term
    setSearchTerm: (searchTerm) => set({ searchTerm }),

    // Setter for searchBy field
    setSearchBy: (searchBy) => set({ searchBy }),

    // Setter for loading state
    setLoading: (loading) => set({ loading }),

    // Create a new machine record
    createMachine: async (machineData) => {
        set({ loading: true });

        // Validate required fields
        const requiredFields = [
            "machineid",
            "machine_name",
            "machine_type",
            "capacity",
            "manufacturer",
            "model",
        ];

        const missingFields = requiredFields.filter((field) => !machineData[field]);

        if (missingFields.length > 0) {
            set({ loading: false });
            return {
                success: false,
                message: `Missing required fields: ${missingFields.join(", ")}`,
            };
        }

        try {
            const res = await axios.post("/api/machines", machineData);

            if (res.status >= 200 && res.status < 300) {
                set((state) => ({ machines: [...state.machines, res.data.data] }));
                set({ loading: false });
                return {
                    success: true,
                    message: "Machine created successfully",
                };
            } else {
                set({ loading: false });
                return {
                    success: false,
                    message: "Failed to create machine",
                };
            }
        } catch (error) {
            console.error("Error creating machine:", error);
            set({ loading: false });
            const errorMessage = error.response?.data?.message || "An error occurred while creating the machine.";
            return {
                success: false,
                message: errorMessage,
            };
        }
    },

    // Fetch all machine records
    fetchMachines: async () => {
        set({ loading: true });

        try {
            const res = await axios.get("/api/machines");

            if (res.status === 200) {
                set({ machines: res.data.data });
            } else {
                throw new Error("Failed to fetch machines data");
            }
        } catch (error) {
            console.error("Error fetching machines:", error);
        } finally {
            set({ loading: false });
        }
    },

    // Update a machine record
    updateMachine: async (id, updatedMachineData) => {
        set({ loading: true });

        // Validate required fields
        const requiredFields = [
            "machineid",
            "machine_name",
            "machine_type",
            "capacity",
            "manufacturer",
            "model",
        ];

        const missingFields = requiredFields.filter((field) => !updatedMachineData[field]);

        if (missingFields.length > 0) {
            set({ loading: false });
            return {
                success: false,
                message: `Missing required fields: ${missingFields.join(", ")}`,
            };
        }

        try {
            const res = await axios.put(`/api/machines/${id}`, updatedMachineData);

            if (res.status >= 200 && res.status < 300) {
                set((state) => ({
                    machines: state.machines.map((machine) => {
                        if (machine.machineid === id) {
                            return res.data.data;
                        }
                        return machine;
                    }),
                }));
                set({ loading: false });
                return {
                    success: true,
                    message: res.data.message || "Machine updated successfully",
                };
            } else {
                set({ loading: false });
                return {
                    success: false,
                    message: "Failed to update machine",
                };
            }
        } catch (error) {
            console.error("Error updating machine:", error);
            set({ loading: false });
            const errorMessage = error.response?.data?.message || "An error occurred while updating the machine.";
            return {
                success: false,
                message: errorMessage,
            };
        }
    },

    // Delete a machine record
    deleteMachine: async (id) => {
        set({ loading: true });

        try {
            const res = await axios.delete(`/api/machines/${id}`);

            if (res.status === 200 || res.status === 204) {
                set((state) => ({
                    machines: state.machines.filter((machine) => machine.machineid !== id),
                }));
                set({ loading: false });
                return { success: true, message: "Machine deleted successfully" };
            } else {
                set({ loading: false });
                return { success: false, message: "Failed to delete machine" };
            }
        } catch (error) {
            console.error("Error deleting machine:", error);
            set({ loading: false });
            const errorMessage = error.response?.data?.message || "An error occurred while deleting the machine.";
            return { success: false, message: errorMessage };
        }
    },

    // Filter machines based on search term and searchBy field
    filterMachines: () => {
        const { machines, searchTerm, searchBy } = get();

        if (!searchTerm) {
            set({ filteredMachines: machines });
            return;
        }

        const filtered = machines.filter((machine) => {
            const fieldValue = String(machine[searchBy]).toLowerCase();
            return fieldValue.includes(searchTerm.toLowerCase());
        });

        set({ filteredMachines: filtered });
    },

}));