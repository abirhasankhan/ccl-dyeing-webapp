// File: client/src/components/AuthRoute.jsx
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/";

export const ProtectedRoute = ({ children, roles = [] }) => {
	const { isAuthenticated, user, loading, initializeAuth } = useAuthStore();
	const location = useLocation();

	useEffect(() => {
		initializeAuth();
	}, [initializeAuth]);

	if (loading) return <div>Loading authentication...</div>;

	if (!isAuthenticated) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	if (roles.length > 0 && !roles.includes(user.role)) {
		return <Navigate to="/" replace />;
	}

	return children;
};

export const GuestRoute = ({ children }) => {
	const { isAuthenticated, loading } = useAuthStore();
	const location = useLocation();

	if (loading) return <div>Loading authentication...</div>;

	if (isAuthenticated) {
		return <Navigate to={location.state?.from || "/"} replace />;
	}

	return children;
};
