import { create } from 'zustand';
import axios from 'axios';

export const useDealOrderStore = create((set, get) => ({

    dealOrders: [],
    filteredDealOrders: [],
    searchTerm: '',
    searchBy: 'name',
    loading: false, // Add loading state

    setDealOrders: (dealOrders) => set({ dealOrders }),

    setFilteredDealOrders: (filteredDealOrders) => set({ filteredDealOrders }),
    
    setSearchTerm: (searchTerm) => set({ searchTerm }),
    
    setSearchBy: (searchBy) => set({ searchBy }),

    setLoading: (loading) => set({ loading }),

    // Create a new deal order
    createDealOrder: async (newDealOrder) => {

        set({ loading: true }); // Start loading

        if (!newDealOrder.deal_id || !newDealOrder.challan_no || !newDealOrder.booking_qty || !newDealOrder.total_received_qty) {
            set({ loading: false }); // End loading
            return {
                success: false,
                message: "Please fill in all required fields",
            };
        }

        try {
            const res = await axios.post("/api/deal-orders", newDealOrder);

            if (res.status >= 200 && res.status < 300) {

                set((state) => ({ dealOrders: [...state.dealOrders, res.data.data] }));
                set({ loading: false }); // End loading
                return {
                    success: true,
                    message: "Deal order created successfully",
                };
            } else {
                set({ loading: false }); // End loading
                return {
                    success: false,
                    message: "Failed to create deal order",
                };
            }
        } catch (error) {
            console.error("Error creating deal order:", error);
            set({ loading: false }); // End loading
            const errorMessage = error.response?.data?.message || "An error occurred while creating the deal order.";
            return {
                success: false,
                message: errorMessage,
            };
        }
    },

    // Fetch deal orders
    fetchDealOrders: async () => {

        set({ loading: true }); // Start loading

        try {
            const res = await axios.get("/api/deal-orders");

            if (res.status === 200) {
                set({ dealOrders: res.data.data });
            } else {
                throw new Error("Failed to fetch deal orders data");
            }
        } catch (error) {
            console.error("Error fetching deal orders data:", error);
        } finally { 
            set({ loading: false }); // End loading
        }
    },

    // Update a deal order
    updateDealOrder: async (id, updatedDealOrder) => {

        set({ loading: true }); // Start loading


        if (!updatedDealOrder.deal_id || !updatedDealOrder.challan_no || !updatedDealOrder.booking_qty || !updatedDealOrder.total_received_qty) {
            set({ loading: false }); // End loading
            return {
                success: false,
                message: "Please fill in all required fields",
            };
        }

        try {
            const res = await axios.put(`/api/deal-orders/${id}`, updatedDealOrder);

            if (res.status >= 200 && res.status < 300) {
                set((state) => ({
                    dealOrders: state.dealOrders.map((dealOrder) => {
                        if (dealOrder.orderid === id) {
                            return res.data.data;
                        }
                        return dealOrder;
                    }),
                }));
                set({ loading: false }); // End loading
                return { success: true, message: res.data.message || "Deal order updated successfully" };
            } else {
                set({ loading: false }); // End loading
                return { success: false, message: "Failed to update deal order" };
            }
        } catch (error) {
            console.error("Error updating deal order:", error);
            set({ loading: false }); // End loading
            const errorMessage = error.response?.data?.message || "An error occurred while updating the deal order.";
            return { success: false, message: errorMessage };
        }
    },

    // Delete a deal order
    deleteDealOrder: async (id) => {

        set({ loading: true }); // Start loading

        try {
            const res = await axios.delete(`/api/deal-orders/${id}`);

            if (res.status === 200 || res.status === 204) {
                set((state) => ({
                    dealOrders: state.dealOrders.filter((dealOrder) => dealOrder.id !== id),
                }));
                set({ loading: false }); // End loading
                return { success: true, message: "Deal order deleted successfully" };
            } else {
                set({ loading: false }); // End loading
                return { success: false, message: "Failed to delete deal order" };
            }
        } catch (error) {
            console.error("Error deleting deal order:", error);
            set({ loading: false }); // End loading
            const errorMessage = error.response?.data?.message || "An error occurred while deleting the deal order.";
            return { success: false, message: errorMessage };
        }
    },



}));