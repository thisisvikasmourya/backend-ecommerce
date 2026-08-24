import { Router } from 'express';
import { healthRoutes } from './health/health.routes.js';
import { authRoutes } from './auth/auth.routes.js';
import { userRoutes } from './users/user.routes.js';
import { addressRoutes } from './addresses/address.routes.js';

const router = Router();

// Health check routes
router.use('/health', healthRoutes);

// Core Modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/addresses', addressRoutes);

export const apiRouter = router;
