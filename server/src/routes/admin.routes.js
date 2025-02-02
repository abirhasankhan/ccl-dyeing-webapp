// File: src/routes/admin.routes.js
import express from 'express';
import { verifyToken, authorize } from '../middleware/authMiddleware.js';
import { adminDashboardHandler } from '../controllers/admin.controller.js';

const router = express.Router();

router.get(
    '/dashboard',
    verifyToken,
    authorize('admin'),
    adminDashboardHandler
);

export default router;