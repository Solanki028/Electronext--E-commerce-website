import { Router } from 'express';
import {
  getActiveBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/banner.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import adminMiddleware from '../middleware/admin.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';

const router = Router();

router.get('/', getActiveBanners);
router.get('/admin/all', authMiddleware, adminMiddleware, getAllBanners);
router.post('/', authMiddleware, adminMiddleware, uploadSingle('image'), createBanner);
router.put('/:id', authMiddleware, adminMiddleware, uploadSingle('image'), updateBanner);
router.delete('/:id', authMiddleware, adminMiddleware, deleteBanner);

export default router;
