import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'campus-swap-super-secure-dev-jwt-secret-2025';

export interface AuthUserPayload {
  id: number;
  email: string;
  name: string;
  university: string;
  campus: string;
}

export interface AuthRequest extends Request {
  user?: AuthUserPayload;
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
      req.user = decoded;
      return next();
    } catch {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token',
      });
      return;
    }
  }

  res.status(401).json({
    success: false,
    message: 'Authentication token is missing or malformed',
  });
};

export const optionalAuthJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
      req.user = decoded;
    } catch {
      // Ignore token validation failure in optional mode
    }
  }

  next();
};

export const generateToken = (user: AuthUserPayload): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      university: user.university,
      campus: user.campus,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};
