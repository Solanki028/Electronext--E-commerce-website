import { Router } from 'express';
import {
  getCategories,
  getCategoryBySlug,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import adminMiddleware from '../middleware/admin.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';

const router = Router();

router.get('/', getCategories);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', getCategoryById);

router.post('/', authMiddleware, adminMiddleware, uploadSingle('image'), createCategory);
router.put('/:id', authMiddleware, adminMiddleware, uploadSingle('image'), updateCategory);
router.delete('/:id', authMiddleware, adminMiddleware, deleteCategory);

export default router;
