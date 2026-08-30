import bcrypt from 'bcryptjs';
import { User } from '../models';
import { generateToken, AuthUserPayload } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  university?: string;
  campus?: string;
  dorm?: string;
  graduationYear?: number;
}

export interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  static async register(input: RegisterInput) {
    const emailLower = input.email.trim().toLowerCase();
    
    // Check if user already exists
    const existing = await User.findOne({ where: { email: emailLower } });
    if (existing) {
      throw new AppError('An account with this university email already exists', 400);
    }

    // Verify student email format
    const isEdu = emailLower.endsWith('.edu') || emailLower.includes('.edu.');
    const universityName = input.university || (emailLower.includes('stanford') ? 'Stanford University' : emailLower.includes('berkeley') ? 'UC Berkeley' : emailLower.includes('nyu') ? 'New York University' : 'State University');
    const campusName = input.campus || (universityName + ' Main Campus');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(input.password, salt);

    const user = await User.create({
      name: input.name,
      email: emailLower,
      password: hashedPassword,
      university: universityName,
      campus: campusName,
      dorm: input.dorm || 'Campus Residence',
      studentIdVerified: isEdu,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?auto=format&fit=crop&q=80&w=250`,
      graduationYear: input.graduationYear || 2026,
      rating: 5.0,
      reviewCount: 0,
    });

    const userPayload: AuthUserPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      university: user.university,
      campus: user.campus,
    };

    const token = generateToken(userPayload);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        university: user.university,
        campus: user.campus,
        dorm: user.dorm,
        studentIdVerified: user.studentIdVerified,
        avatar: user.avatar,
        graduationYear: user.graduationYear,
        rating: user.rating,
        reviewCount: user.reviewCount,
      },
    };
  }

  static async login(input: LoginInput) {
    const emailLower = input.email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: emailLower } });

    if (!user || !user.password) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const userPayload: AuthUserPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      university: user.university,
      campus: user.campus,
    };

    const token = generateToken(userPayload);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        university: user.university,
        campus: user.campus,
        dorm: user.dorm,
        studentIdVerified: user.studentIdVerified,
        avatar: user.avatar,
        graduationYear: user.graduationYear,
        rating: user.rating,
        reviewCount: user.reviewCount,
      },
    };
  }

  static async getMe(userId: number) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  static async getDemoUsers() {
    return User.findAll({
      limit: 6,
      attributes: { exclude: ['password'] },
      order: [['id', 'ASC']],
    });
  }

  static async loginDemoUser(userId: number) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('Demo user not found', 404);
    }

    const userPayload: AuthUserPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      university: user.university,
      campus: user.campus,
    };

    const token = generateToken(userPayload);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        university: user.university,
        campus: user.campus,
        dorm: user.dorm,
        studentIdVerified: user.studentIdVerified,
        avatar: user.avatar,
        graduationYear: user.graduationYear,
        rating: user.rating,
        reviewCount: user.reviewCount,
      },
    };
  }
}
