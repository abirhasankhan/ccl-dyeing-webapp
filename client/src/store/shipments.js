import { create } from 'zustand';
import axios from 'axios';

export const useShipmentStore = create((set, get) => ({

    shipments: [],
    filteredShipments: [],
    searchTerm: '',
    searchBy: 'name',
    loading: false, // Add loading state

    setShipments: (shipments) => set({ shipments }),

    setFilteredShipments: (filteredShipments) => set({ filteredShipments }),

    setSearchTerm: (searchTerm) => set({ searchTerm }),

    setSearchBy: (searchBy) => set({ searchBy }),

    setLoading: (loading) => set({ loading }),


    // Create a new shipment
    createShipment: async (shipment) => {

        set({ loading: true }); // Start loading

        if (!shipment.orderid || !shipment.shipment_date || !shipment.quantity_shipped ) {
            set({ loading: false }); // End loading
            return {
                success: false,
                message: "Please fill in all required fields",
            };
        }

        try {

            const res = await axios.post("/api/shipments", shipment);

            if (res.status >= 200 && res.status < 300) {
                
                set((state) => ({ shipments: [...state.shipments, res.data.data] }));
                set({ loading: false }); // End loading
                return {
                    success: true,
                    message: "Shipment created successfully",
                };
            } else {
                set({ loading: false }); // End loading
                return {
                    success: false,
                    message: "Failed to create shipment",
                }
            }
        }catch (error) {

            console.error("Error creating shipment:", error);
            set({ loading: false }); // End loading
            const errorMessage = error.response?.data?.message || "An error occurred while creating the shipment.";
            return {
                success: false,
                message: errorMessage,
            };
        }
    },


    // Fetch shipments
    fetchShipments: async () => {

        set({ loading: true }); // Start loading

        try {
            const res = await axios.get("/api/shipments");

            if (res.status === 200) {
                set({ shipments: res.data.data });
            } else {
                throw new Error("Failed to fetch shipments data");
            }
        } catch (error) {
            console.error("Error fetching shipments:", error);
        } finally {
            set({ loading: false }); // End loading
        }
    },

    // Update a shipment
    updateShipment: async (id, updatedShipment) => {

        set({ loading: true }); // Start loading

        if (!updatedShipment.orderid || !updatedShipment.shipment_date || !updatedShipment.quantity_shipped) {

            set({ loading: false }); // End loading
            return {
                success: false,
                message: "Please fill in all required fields",
            };
        }


        try {
            const res = await axios.put(`/api/shipments/${id}`, updatedShipment);

            if (res.status >= 200 && res.status < 300) {
                set((state) => ({
                    shipments: state.shipments.map((shipment) => {
                        if (shipment.id === id) {
                            return res.data.data;
                        }
                        return shipment;
                    }),
                }));
                set({ loading: false }); // End loading
                return {
                    success: true,
                    message:  res.data.message||"Shipment updated successfully",
                };
            } else {
                set({ loading: false }); // End loading
                return {
                    success: false,
                    message: "Failed to update shipment",
                }
            }
        } catch (error) {
            console.error("Error updating shipment:", error);
            set({ loading: false }); // End loading
            const errorMessage = error.response?.data?.message || "An error occurred while updating the shipment.";
            return {
                success: false,
                message: errorMessage,
            };
        }
    },

    // Delete a shipment
    deleteShipment: async (id) => {

        set({ loading: true }); // Start loading

        try {
            const res = await axios.delete(`/api/shipments/${id}`);

            if (res.status === 200 || res.status === 204) {
                set((state) => ({
                    shipments: state.shipments.filter((shipment) => shipment.id !== id),
                }));
                set({ loading: false }); // End loading
                return { success: true, message: "Shipment deleted successfully" };
            } else {
                set({ loading: false }); // End loading
                return { success: false, message: "Failed to delete shipment" };
            }
        } catch (error) {
            console.error("Error deleting shipment:", error);
            set({ loading: false }); // End loading
            const errorMessage = error.response?.data?.message || "An error occurred while deleting the shipment.";
            return { success: false, message: errorMessage };
        }
    },


}));