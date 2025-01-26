import { create } from 'zustand';
import axios from 'axios';

export const useProductDetailsStore = create((set, get) => ({

    productDetails: [],
    filteredProductDetails: [],
    searchTerm: '',
    searchBy: 'name',
    loading: false,

    setProductDetails: (productDetails) => set({ productDetails }),

    setFilteredProductDetails: (filteredProductDetails) => set({ filteredProductDetails }),

    setSearchTerm: (searchTerm) => set({ searchTerm }),

    setSearchBy: (searchBy) => set({ searchBy }),

    setLoading: (loading) => set({ loading }),

    // Create a new product detail
    createProductDetail: async (productDetail) => {

        set({ loading: true });

        if (!productDetail.shipmentid) {

            set({ loading: false });
            return {
                success: false,
                message: "Please fill in all required fields",
            };
        }

        try {
            const res = await axios.post("/api/product-details", productDetail);

            if (res.status >= 200 && res.status < 300) {

                set((state) => ({ productDetails: [...state.productDetails, res.data.data] }));
                set({ loading: false });
                return {
                    success: true,
                    message: "Product detail created successfully",
                };
            } else {
                set({ loading: false });
                return {
                    success: false,
                    message: "Failed to create product detail",
                };
            }
        } catch (error) {
            console.error("Error creating product detail:", error);
            set({ loading: false });
            const errorMessage = error.response?.data?.message || "An error occurred while creating the product detail.";
            return {
                success: false,
                message: errorMessage,
            };
        }
    },

    // Fetch product details
    fetchProductDetails: async () => {
        
        set({ loading: true });

        try {
            const res = await axios.get("/api/product-details");

            if (res.status === 200) {
                set({ productDetails: res.data.data });
            } else {
                throw new Error("Failed to fetch product details data");
            }
        } catch (error) {
            console.error("Error fetching product details:", error);
        } finally {
            set({ loading: false });
        }
    },

    // Update a product detail
    updateProductDetail: async (id, updatedProductDetail) => {
        set({ loading: true });

        if (!updatedProductDetail.shipmentid) {
            set({ loading: false });
            return {
                success: false,
                message: "Please fill in all required fields",
            };
        }

        try {
            const res = await axios.put(`/api/product-details/${id}`, updatedProductDetail);

            if (res.status >= 200 && res.status < 300) {
                set((state) => ({
                    productDetails: state.productDetails.map((productDetail) => {
                        if (productDetail.productdetailid === id) {
                            return res.data.data;
                        }
                        return productDetail;
                    }),
                }));
                set({ loading: false });
                return {
                    success: true,
                    message: res.data.message || "Product detail updated successfully",
                };
            } else {
                set({ loading: false });
                return {
                    success: false,
                    message: "Failed to update product detail",
                };
            }
        } catch (error) {
            console.error("Error updating product detail:", error);
            set({ loading: false });
            const errorMessage = error.response?.data?.message || "An error occurred while updating the product detail.";
            return {
                success: false,
                message: errorMessage,
            };
        }
    },

    // Delete a product detail
    deleteProductDetail: async (id) => {

        set({ loading: true });

        try {
            const res = await axios.delete(`/api/product-details/${id}`);

            if (res.status === 200 || res.status === 204) {
                set((state) => ({
                    productDetails: state.productDetails.filter((productDetail) => productDetail.productdetailid !== id),
                }));
                set({ loading: false });
                return { success: true, message: "Product detail deleted successfully" };
            } else {
                set({ loading: false });
                return { success: false, message: "Failed to delete product detail" };
            }
        } catch (error) {
            console.error("Error deleting product detail:", error);
            set({ loading: false });
            const errorMessage = error.response?.data?.message || "An error occurred while deleting the product detail.";
            return { success: false, message: errorMessage };
        }
    },

    
}));
