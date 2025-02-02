import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/apiError.js';

// Cookie configuration (move to separate config file if reused)


// After - Create separate clear config
const CLEAR_COOKIE_CONFIG = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: process.env.COOKIE_DOMAIN || 'localhost'
};


export const verifyToken = (req, res, next) => {
    try {
        // Skip authentication for public routes
        const publicPaths = ['/api/auth/login', '/api/auth/register'];
        if (publicPaths.includes(req.path)) return next();

        const token = req.cookies?.token ||
            req.headers['authorization']?.split(' ')[1] ||
            req.query?.token;
        console.debug('[AUTH] Token:', token); // Check if the token is there


        if (!token) {
            console.warn('[AUTH] No token provided for protected route:', req.path);
            throw new ApiError(401, 'Authentication required');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            userId: decoded.userId,
            role: decoded.role
        };

        console.log("Token received:", token);


        next();
    } catch (error) {
        console.error('[AUTH] Verification failed:', error.message);
        res.clearCookie('token', CLEAR_COOKIE_CONFIG);
        next(handleJWTError(error));
    }
};

// Role-based access control
export const authorize = (...requiredRoles) => {
    return (req, res, next) => {
        try {
            console.debug('[AUTH] Role check:', {
                required: requiredRoles,
                userRole: req.user?.role,
                path: req.path
            });

            if (!requiredRoles.includes(req.user.role)) {
                console.warn('[AUTH] Permission denied:', {
                    userId: req.user?.userId,
                    requiredRoles,
                    actualRole: req.user?.role
                });
                throw new ApiError(403, 'Insufficient permissions');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

// Error handling middleware
const handleJWTError = (error) => {
    if (error instanceof jwt.JsonWebTokenError) {
        return new ApiError(401, 'Invalid authentication token');
    }
    if (error instanceof jwt.TokenExpiredError) {
        return new ApiError(401, 'Session expired - Please login again');
    }
    return error instanceof ApiError ? error : new ApiError(401, 'Authentication failed');
};


// Optional: Create specific role middlewares
export const isAdmin = authorize('admin');
export const isModerator = authorize('moderator');
export const isUser = authorize('user');