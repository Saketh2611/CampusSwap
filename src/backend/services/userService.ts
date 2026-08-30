import { User, Listing, Review } from '../models';
import { AppError } from '../middleware/errorHandler';

export class UserService {
  static async getProfile(userId: number) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Listing,
          as: 'listings',
        },
        {
          model: Review,
          as: 'receivedReviews',
          include: [
            {
              model: User,
              as: 'reviewer',
              attributes: ['id', 'name', 'avatar', 'university', 'studentIdVerified'],
            },
          ],
        },
      ],
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  static async updateProfile(userId: number, data: any) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await user.update({
      name: data.name || user.name,
      dorm: data.dorm !== undefined ? data.dorm : user.dorm,
      bio: data.bio !== undefined ? data.bio : user.bio,
      avatar: data.avatar || user.avatar,
      graduationYear: data.graduationYear || user.graduationYear,
      campus: data.campus || user.campus,
      university: data.university || user.university,
    });

    return this.getProfile(userId);
  }

  static async getUserListings(userId: number, status?: string) {
    const where: any = { sellerId: userId };
    if (status) {
      where.status = status;
    }

    return Listing.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
  }

  static async verifyStudentEdu(userId: number, eduEmail: string) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const email = eduEmail.trim().toLowerCase();
    if (!email.endsWith('.edu') && !email.includes('.edu.')) {
      throw new AppError('Must provide a valid .edu university email address', 400);
    }

    await user.update({
      email,
      studentIdVerified: true,
    });

    return {
      success: true,
      message: 'Student status verified successfully with verified campus badge',
      user: {
        id: user.id,
        email: user.email,
        studentIdVerified: true,
      },
    };
  }
}
