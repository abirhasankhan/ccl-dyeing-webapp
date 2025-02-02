// File: src/routes/user.routes.js
import express from 'express';
import { registerUser, loginUser, logoutUser, getCurrentUser, refreshToken } from '../controllers/users.controller.js';
import { verifyToken, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.post('/logout', verifyToken, logoutUser);
router.get('/me', verifyToken, getCurrentUser);
// Protected routes
router.get('/profile', verifyToken, getCurrentUser);
router.post('/refresh', verifyToken, refreshToken);


export default router;