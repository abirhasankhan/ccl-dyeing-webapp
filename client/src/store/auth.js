// File: client/src/store/userStore.js
import { create } from 'zustand';
import axios from 'axios';

export const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,

    // Initialize auth state
    // Change the initializeAuth endpoint
    initializeAuth: async () => {
        set({ loading: true });
        try {
            const res = await axios.get('/api/users/me', {
                withCredentials: true
            });
            set({ user: res.data.data, isAuthenticated: true });
        } catch (error) {
            set({ user: null, isAuthenticated: false });
        } finally {
            set({ loading: false });
        }
    },

    // Login action
    login: async (credentials) => {
        set({ loading: true, error: null });
        try {
            const res = await axios.post('/api/users/login', credentials, {
                withCredentials: true
            });
            // Immediately update local state
            set({
                user: res.data.user,
                isAuthenticated: true
            });  
            // Refresh auth state from server
            await get().initializeAuth();

            return { success: true, message: "Login successful" };         
        } catch (error) {
            set({ error: error.response?.data?.message || 'Login failed' });
            return { success: false };
        } finally {
            set({ loading: false });
        }
    },


    createUser: async (userData) => {
        set({ loading: true, error: null });

        // Validation
        const requiredFields = ['name', 'email', 'password', 'role'];
        const missingFields = requiredFields.filter(field => !userData[field]);

        if (missingFields.length > 0) {
            set({ loading: false });
            return {
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            };
        }

        try {
            const res = await axios.post('/api/users/register', userData);

            if (res.status >= 200 && res.status < 300) {
                set(state => ({
                    users: [...state.users, res.data.data],
                    filteredUsers: [...state.filteredUsers, res.data.data]
                }));
                return { success: true, message: "User created successfully" };
            }
        } catch (error) {
            console.error("Create user error:", error);
            const errorMessage = error.response?.data?.message || "Failed to create user";
            set({ error: errorMessage });
            return { success: false, message: errorMessage };
        } finally {
            set({ loading: false });
        }
    },

    // Logout action
    logout: async () => {
        set({ loading: true });
        try {
            await axios.post('/api/users/logout', {}, { withCredentials: true });
            set({ user: null, isAuthenticated: false });
        } finally {
            set({ loading: false });
        }
    }
}));