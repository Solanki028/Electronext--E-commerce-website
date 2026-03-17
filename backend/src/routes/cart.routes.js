import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItemQty,
  removeFromCart,
  clearCart,
  applyCouponToCart,
  removeCouponFromCart,
} from '../controllers/cart.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { z } from 'zod';

const router = Router();
router.use(authMiddleware);

const addSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).optional(),
  variant: z.object({ name: z.string(), value: z.string() }).optional().nullable(),
});

router.get('/', getCart);
router.post('/items', validate(addSchema), addToCart);
router.patch('/items', validate(z.object({ productId: z.string(), quantity: z.number().int().min(0), variant: z.any().optional() })), updateCartItemQty);
router.delete('/items/:productId', removeFromCart);
router.delete('/clear', clearCart);
router.post('/coupon', validate(z.object({ couponCode: z.string().min(1) })), applyCouponToCart);
router.delete('/coupon', removeCouponFromCart);

export default router;
