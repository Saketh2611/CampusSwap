import { Router } from 'express';
import { z } from 'zod';
import { AuthController } from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

const registerSchema = {
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    university: z.string().optional(),
    campus: z.string().optional(),
    dorm: z.string().optional(),
    graduationYear: z.number().optional(),
  }),
};

const loginSchema = {
  body: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
};

router.post('/register', validateRequest(registerSchema), AuthController.register);
router.post('/login', validateRequest(loginSchema), AuthController.login);
router.get('/me', authenticateJWT, AuthController.getMe);
router.get('/demo-users', AuthController.getDemoUsers);
router.post('/demo-login/:userId', AuthController.loginDemoUser);

export default router;
