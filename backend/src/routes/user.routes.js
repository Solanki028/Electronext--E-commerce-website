import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  updateAvatar,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  toggleWishlist,
} from '../controllers/user.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { z } from 'zod';

const router = Router();
router.use(authMiddleware);

const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(10),
  street: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  zipCode: z.string().min(4),
  country: z.string().default('India'),
  isDefault: z.boolean().optional(),
});

router.get('/profile', getProfile);
router.patch('/profile', validate(z.object({ name: z.string().min(2).optional(), phone: z.string().optional() })), updateProfile);
router.patch('/avatar', uploadSingle('avatar'), updateAvatar);
router.patch('/change-password', validate(z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8) })), changePassword);

router.post('/addresses', validate(addressSchema), addAddress);
router.put('/addresses/:addressId', validate(addressSchema.partial()), updateAddress);
router.delete('/addresses/:addressId', deleteAddress);

router.post('/wishlist/:productId', toggleWishlist);

export default router;
