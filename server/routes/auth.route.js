import express from 'express';
import { createUser, validateUser } from '../controllers/user.controller.js';

const router = express.Router();

// Route to create a new user
router.post('/create', createUser);

// Route to validate a user (login)
router.post('/validate', validateUser);

export default router;
