import { create } from 'zustand';
import axios from 'axios';

export const useInvoiceStore = create((set, get) => ({
    invoices: [], // Stores all invoice records
    filteredInvoices: [], // Stores filtered invoice records
    searchTerm: '', // Search term for filtering
    searchBy: 'invoiceid', // Field to search by (default: invoiceid)
    loading: false, // Loading state
    currentPage: 1, // Current page for pagination
    totalPages: 1, // Total pages for pagination
    limit: 10, // Number of items per page

    // Setter for invoices
    setInvoices: (invoices) => set({ invoices }),

    // Setter for filtered invoices
    setFilteredInvoices: (filteredInvoices) => set({ filteredInvoices }),

    // Setter for search term
    setSearchTerm: (searchTerm) => set({ searchTerm }),

    // Setter for searchBy field
    setSearchBy: (searchBy) => set({ searchBy }),

    // Setter for loading state
    setLoading: (loading) => set({ loading }),

    // Setter for current page
    setCurrentPage: (currentPage) => set({ currentPage }),

    // Setter for total pages
    setTotalPages: (totalPages) => set({ totalPages }),

    // Create a new invoice
    createInvoice: async (invoiceData) => {
        set({ loading: true });

        // Validate required fields
        const requiredFields = ["processid", "amount", "due_date"];
        const missingFields = requiredFields.filter((field) => !invoiceData[field]);

        if (missingFields.length > 0) {
            set({ loading: false });
            return {
                success: false,
                message: `Missing required fields: ${missingFields.join(", ")}`,
            };
        }

        try {
            const res = await axios.post("/api/invoices", invoiceData);

            if (res.status >= 200 && res.status < 300) {
                set((state) => ({ invoices: [...state.invoices, res.data.data] }));
                set({ loading: false });
                return {
                    success: true,
                    message: "Invoice created successfully",
                };
            } else {
                set({ loading: false });
                return {
                    success: false,
                    message: "Failed to create invoice",
                };
            }
        } catch (error) {
            console.error("Error creating invoice:", error);
            set({ loading: false });
            const errorMessage = error.response?.data?.message || "An error occurred while creating the invoice.";
            return {
                success: false,
                message: errorMessage,
            };
        }
    },

    // Fetch all invoices with pagination
    fetchInvoices: async (page = 1, limit = 10) => {
        set({ loading: true });

        try {
            const res = await axios.get(`/api/invoices?page=${page}&limit=${limit}`);

            if (res.status === 200) {
                set({
                    invoices: res.data.data.invoices,
                    currentPage: page,
                    totalPages: res.data.data.totalPages,
                    totalCount: res.data.data.totalCount,
                });
            } else {
                throw new Error("Failed to fetch invoices data");
            }
        } catch (error) {
            console.error("Error fetching invoices:", error);
        } finally {
            set({ loading: false });
        }
    },

    // Update an invoice
    updateInvoice: async (id, updatedInvoiceData) => {
        set({ loading: true });

        // Validate required fields
        const requiredFields = ["processid", "amount", "due_date"];
        const missingFields = requiredFields.filter((field) => !updatedInvoiceData[field]);

        if (missingFields.length > 0) {
            set({ loading: false });
            return {
                success: false,
                message: `Missing required fields: ${missingFields.join(", ")}`,
            };
        }

        try {
            const res = await axios.put(`/api/invoices/${id}`, updatedInvoiceData);

            if (res.status >= 200 && res.status < 300) {
                set((state) => ({
                    invoices: state.invoices.map((invoice) => {
                        if (invoice.invoiceid === id) {
                            return res.data.data;
                        }
                        return invoice;
                    }),
                }));
                set({ loading: false });
                return {
                    success: true,
                    message: res.data.message || "Invoice updated successfully",
                };
            } else {
                set({ loading: false });
                return {
                    success: false,
                    message: "Failed to update invoice",
                };
            }
        } catch (error) {
            console.error("Error updating invoice:", error);
            set({ loading: false });
            const errorMessage = error.response?.data?.message || "An error occurred while updating the invoice.";
            return {
                success: false,
                message: errorMessage,
            };
        }
    },

    // Delete an invoice (only if status is "Unpaid")
    deleteInvoice: async (id) => {
        set({ loading: true });

        try {
            const res = await axios.delete(`/api/invoices/${id}`);

            if (res.status === 200 || res.status === 204) {
                set((state) => ({
                    invoices: state.invoices.filter((invoice) => invoice.invoiceid !== id),
                }));
                set({ loading: false });
                return { success: true, message: "Invoice deleted successfully" };
            } else {
                set({ loading: false });
                return { success: false, message: "Failed to delete invoice" };
            }
        } catch (error) {
            console.error("Error deleting invoice:", error);
            set({ loading: false });
            const errorMessage = error.response?.data?.message || "An error occurred while deleting the invoice.";
            return { success: false, message: errorMessage };
        }
    },

    // Filter invoices based on search term and searchBy field
    filterInvoices: () => {
        const { invoices, searchTerm, searchBy } = get();

        if (!searchTerm) {
            set({ filteredInvoices: invoices });
            return;
        }

        const filtered = invoices.filter((invoice) => {
            const fieldValue = String(invoice[searchBy]).toLowerCase();
            return fieldValue.includes(searchTerm.toLowerCase());
        });

        set({ filteredInvoices: filtered });
    },
}));