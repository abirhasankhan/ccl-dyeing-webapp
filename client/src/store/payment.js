import { create } from "zustand";
import axios from "axios";

export const usePaymentStore = create((set, get) => ({
    
    payments: [], // Stores all payment records
    filteredPayments: [], // Stores filtered payment records
    searchTerm: "", // Search term for filtering
    searchBy: "paymentid", // Field to search by (default: paymentid)
    loading: false, // Loading state

    // Setter for payments
    setPayments: (payments) => set({ payments }),

    // Setter for filtered payments
    setFilteredPayments: (filteredPayments) => set({ filteredPayments }),

    // Setter for search term
    setSearchTerm: (searchTerm) => set({ searchTerm }),

    // Setter for searchBy field
    setSearchBy: (searchBy) => set({ searchBy }),

    // Setter for loading state
    setLoading: (loading) => set({ loading }),

    // Create a new payment record
    createPayment: async (paymentData) => {
        set({ loading: true });

        // Validate required fields
        const requiredFields = ["invoiceid", "amount"];
        const missingFields = requiredFields.filter((field) => !paymentData[field]);

        if (missingFields.length > 0) {
            set({ loading: false });
            return {
                success: false,
                message: `Missing required fields: ${missingFields.join(", ")}`,
            };
        }

        try {
            const res = await axios.post("/api/payments", paymentData);

            if (res.status >= 200 && res.status < 300) {
                set((state) => ({ payments: [...state.payments, res.data.data] }));
                set({ loading: false });
                return {
                    success: true,
                    message: "Payment record created successfully",
                };
            } else {
                set({ loading: false });
                return {
                    success: false,
                    message: "Failed to create payment record",
                };
            }
        } catch (error) {
            console.error("Error creating payment record:", error);
            set({ loading: false });
            const errorMessage =
                error.response?.data?.message || "An error occurred while creating the payment record.";
            return {
                success: false,
                message: errorMessage,
            };
        }
    },

    // Fetch all payment records
    fetchPayments: async () => {
        set({ loading: true });

        try {
            const res = await axios.get("/api/payments");

            if (res.status === 200) {
                set({ payments: res.data.data });
            } else {
                throw new Error("Failed to fetch payment records");
            }
        } catch (error) {
            console.error("Error fetching payment records:", error);
        } finally {
            set({ loading: false });
        }
    },

    // Update a payment record
    updatePayment: async (id, updatedPaymentData) => {
        set({ loading: true });

        // Validate required fields
        const requiredFields = ["invoiceid", "amount", "payment_method"];
        const missingFields = requiredFields.filter((field) => !updatedPaymentData[field]);

        if (missingFields.length > 0) {
            set({ loading: false });
            return {
                success: false,
                message: `Missing required fields: ${missingFields.join(", ")}`,
            };
        }

        try {
            const res = await axios.put(`/api/payments/${id}`, updatedPaymentData);

            if (res.status >= 200 && res.status < 300) {
                set((state) => ({
                    payments: state.payments.map((payment) => {
                        if (payment.paymentid === id) {
                            return res.data.data;
                        }
                        return payment;
                    }),
                }));
                set({ loading: false });
                return {
                    success: true,
                    message: res.data.message || "Payment record updated successfully",
                };
            } else {
                set({ loading: false });
                return {
                    success: false,
                    message: "Failed to update payment record",
                };
            }
        } catch (error) {
            console.error("Error updating payment record:", error);
            set({ loading: false });
            const errorMessage =
                error.response?.data?.message || "An error occurred while updating the payment record.";
            return {
                success: false,
                message: errorMessage,
            };
        }
    },

    // Delete a payment record
    deletePayment: async (id) => {
        set({ loading: true });

        try {
            const res = await axios.delete(`/api/payments/${id}`);

            if (res.status === 200 || res.status === 204) {
                set((state) => ({
                    payments: state.payments.filter((payment) => payment.paymentid !== id),
                }));
                set({ loading: false });
                return { success: true, message: "Payment record deleted successfully" };
            } else {
                set({ loading: false });
                return { success: false, message: "Failed to delete payment record" };
            }
        } catch (error) {
            console.error("Error deleting payment record:", error);
            set({ loading: false });
            const errorMessage =
                error.response?.data?.message || "An error occurred while deleting the payment record.";
            return { success: false, message: errorMessage };
        }
    },

    // Filter payment records based on search term and searchBy field
    filterPayments: () => {
        const { payments, searchTerm, searchBy } = get();

        if (!searchTerm) {
            set({ filteredPayments: payments });
            return;
        }

        const filtered = payments.filter((payment) => {
            const fieldValue = String(payment[searchBy]).toLowerCase();
            return fieldValue.includes(searchTerm.toLowerCase());
        });

        set({ filteredPayments: filtered });
    },
}));