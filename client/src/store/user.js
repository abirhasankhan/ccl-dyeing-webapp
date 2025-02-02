import { create } from 'zustand';
import axios from 'axios';

export const useUserStore = create((set, get) => ({
    user: null,                         // Current authenticated user
    isAuthenticated: false,             // Authentication status
    users: [],                          // All users (for admin management)
    filteredUsers: [],                  // Filtered list of users
    searchTerm: '',                     // Search term for filtering
    searchBy: 'email',                  // Field to search by (default: email)
    loading: false,                     // Loading state
    error: null,                        // Error state

    // Setters
    setUsers: (users) => set({ users }),
    setFilteredUsers: (filteredUsers) => set({ filteredUsers }),
    setSearchTerm: (searchTerm) => set({ searchTerm }),
    setSearchBy: (searchBy) => set({ searchBy }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    // Authentication Actions
    login: async (credentials) => {
        set({ loading: true });

        try {
            const res = await axios.post('/api/users/login', credentials);

            if (res.status >= 200 && res.status < 300) {
                set({
                    user: res.data.user,
                    isAuthenticated: true,
                    loading: false
                });
                return { success: true, message: "Login successful" };
            } else {
                set({ loading: false });
                return {
                    success: false,
                    message: "Failed to login. Please check your credentials.",
                };
            }
        } catch (error) {
            console.error("Login error:", error);
            const errorMessage = error.response?.data?.message || "Login failed";
            return { success: false, message: errorMessage };
        }
    },

    logout: async () => {
        set({ loading: true });
        try {
            await axios.post('/api/auth/logout');
            set({
                user: null,
                isAuthenticated: false,
                loading: false
            });
            return { success: true, message: "Logout successful" };
        } catch (error) {
            console.error("Logout error:", error);
            set({ error: error.message, loading: false });
            return { success: false, message: "Logout failed" };
        }
    },

    // User Management Actions
    fetchUsers: async () => {
        set({ loading: true });
        try {
            const res = await axios.get('/api/users');
            if (res.status === 200) {
                set({ users: res.data.data, filteredUsers: res.data.data });
            }
        } catch (error) {
            console.error("Fetch users error:", error);
            set({ error: error.response?.data?.message || "Failed to fetch users" });
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
            const res = await axios.post('/api/auth/register', userData);

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

    updateUser: async (userId, userData) => {
        set({ loading: true, error: null });

        // Validation
        const requiredFields = ['name', 'email', 'role'];
        const missingFields = requiredFields.filter(field => !userData[field]);

        if (missingFields.length > 0) {
            set({ loading: false });
            return {
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            };
        }

        try {
            const res = await axios.put(`/api/users/${userId}`, userData);

            if (res.status >= 200 && res.status < 300) {
                set(state => ({
                    users: state.users.map(user =>
                        user.id === userId ? res.data.data : user
                    ),
                    filteredUsers: state.filteredUsers.map(user =>
                        user.id === userId ? res.data.data : user
                    )
                }));
                return { success: true, message: "User updated successfully" };
            }
        } catch (error) {
            console.error("Update user error:", error);
            const errorMessage = error.response?.data?.message || "Failed to update user";
            set({ error: errorMessage });
            return { success: false, message: errorMessage };
        } finally {
            set({ loading: false });
        }
    },

    deleteUser: async (userId) => {
        set({ loading: true, error: null });

        try {
            const res = await axios.delete(`/api/users/${userId}`);

            if (res.status === 200 || res.status === 204) {
                set(state => ({
                    users: state.users.filter(user => user.id !== userId),
                    filteredUsers: state.filteredUsers.filter(user => user.id !== userId)
                }));
                return { success: true, message: "User deleted successfully" };
            }
        } catch (error) {
            console.error("Delete user error:", error);
            const errorMessage = error.response?.data?.message || "Failed to delete user";
            set({ error: errorMessage });
            return { success: false, message: errorMessage };
        } finally {
            set({ loading: false });
        }
    },

    // Filter users based on search criteria
    filterUsers: () => {
        const { users, searchTerm, searchBy } = get();

        if (!searchTerm) {
            set({ filteredUsers: users });
            return;
        }

        const filtered = users.filter(user => {
            const fieldValue = String(user[searchBy]).toLowerCase();
            return fieldValue.includes(searchTerm.toLowerCase());
        });

        set({ filteredUsers: filtered });
    }
}));