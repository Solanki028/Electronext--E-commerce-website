import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  getMe,
} from '../controllers/auth.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { z } from 'zod';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  guestCart: z.array(z.any()).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  guestCart: z.array(z.any()).optional(),
});

const forgotSchema = z.object({ email: z.string().email() });
const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(100),
});

router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refreshAccessToken);
router.post('/forgot-password', authRateLimiter, validate(forgotSchema), forgotPassword);
router.post('/reset-password', authRateLimiter, validate(resetSchema), resetPassword);
router.get('/me', authMiddleware, getMe);

export default router;
