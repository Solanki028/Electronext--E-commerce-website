import { Router } from 'express';
import {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  setUserRole,
  deleteReviewAdmin,
} from '../controllers/admin.controller.js';
import {
  getAllOrders,
  updateOrderStatusAdmin,
  getAdminOrderById,
} from '../controllers/order.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import adminMiddleware from '../middleware/admin.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { z } from 'zod';

const router = Router();
router.use(authMiddleware, adminMiddleware);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Users
router.get('/users', getAllUsers);
router.patch('/users/:userId/toggle-status', toggleUserStatus);
router.patch('/users/:userId/role', validate(z.object({ role: z.enum(['user', 'admin']) })), setUserRole);

// Orders
router.get('/orders', getAllOrders);
router.get('/orders/:id', getAdminOrderById);
router.patch('/orders/:id/status', validate(z.object({ status: z.string(), comment: z.string().optional(), trackingNumber: z.string().optional() })), updateOrderStatusAdmin);

// Reviews
router.delete('/reviews/:reviewId', deleteReviewAdmin);

export default router;
