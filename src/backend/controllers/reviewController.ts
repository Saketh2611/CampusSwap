import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/reviewService';
import { AuthRequest } from '../middleware/auth';

export class ReviewController {
  static async createReview(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      const { targetUserId, listingId, rating, comment, role } = req.body;
      const review = await ReviewService.createReview({
        reviewerId: req.user.id,
        targetUserId: Number(targetUserId),
        listingId: listingId ? Number(listingId) : undefined,
        rating: Number(rating),
        comment,
        role: role || 'buyer',
      });

      res.status(201).json({
        success: true,
        message: 'Review posted successfully',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = Number(req.params.userId);
      const reviews = await ReviewService.getUserReviews(userId);
      res.status(200).json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  }
}
