import { Router } from 'express';
import { z } from 'zod';
import { ReviewController } from '../controllers/reviewController';
import { authenticateJWT } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

const createReviewSchema = {
  body: z.object({
    targetUserId: z.number(),
    listingId: z.number().optional(),
    rating: z.number().min(1).max(5),
    comment: z.string().min(3, 'Review comment must be at least 3 characters'),
    role: z.enum(['buyer', 'seller']).optional(),
  }),
};

router.get('/user/:userId', ReviewController.getUserReviews);
router.post('/', authenticateJWT, validateRequest(createReviewSchema), ReviewController.createReview);

export default router;
