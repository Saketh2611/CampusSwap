import { Review, User, Listing } from '../models';
import { AppError } from '../middleware/errorHandler';

export interface CreateReviewInput {
  reviewerId: number;
  targetUserId: number;
  listingId?: number;
  rating: number;
  comment: string;
  role: 'buyer' | 'seller';
}

export class ReviewService {
  static async createReview(input: CreateReviewInput) {
    if (input.reviewerId === input.targetUserId) {
      throw new AppError('You cannot review yourself', 400);
    }

    const targetUser = await User.findByPk(input.targetUserId);
    if (!targetUser) {
      throw new AppError('Target user not found', 404);
    }

    const review = await Review.create({
      reviewerId: input.reviewerId,
      targetUserId: input.targetUserId,
      listingId: input.listingId,
      rating: Math.min(5, Math.max(1, input.rating)),
      comment: input.comment,
      role: input.role,
    });

    // Recalculate target user's average rating and review count
    const allReviews = await Review.findAll({
      where: { targetUserId: input.targetUserId },
      attributes: ['rating'],
    });

    const total = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = Number((total / allReviews.length).toFixed(1));

    await targetUser.update({
      rating: avg,
      reviewCount: allReviews.length,
    });

    return Review.findByPk(review.id, {
      include: [
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name', 'avatar', 'university', 'studentIdVerified'],
        },
      ],
    });
  }

  static async getUserReviews(userId: number) {
    return Review.findAll({
      where: { targetUserId: userId },
      include: [
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name', 'avatar', 'university', 'studentIdVerified'],
        },
        {
          model: Listing,
          as: 'listing',
          attributes: ['id', 'title', 'price', 'images'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }
}
