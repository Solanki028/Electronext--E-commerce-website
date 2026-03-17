import { Router } from 'express';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  markHelpful,
} from '../controllers/review.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { z } from 'zod';

const router = Router({ mergeParams: true });

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().min(10).max(2000),
  orderId: z.string().optional(),
});

router.get('/', getProductReviews);
router.post('/', authMiddleware, validate(reviewSchema), createReview);
router.put('/:reviewId', authMiddleware, validate(reviewSchema.partial()), updateReview);
router.delete('/:reviewId', authMiddleware, deleteReview);
router.post('/:reviewId/helpful', authMiddleware, markHelpful);

export default router;
