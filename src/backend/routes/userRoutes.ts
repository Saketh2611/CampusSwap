import { Router } from 'express';
import { z } from 'zod';
import { UserController } from '../controllers/userController';
import { authenticateJWT } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

const verifyEduSchema = {
  body: z.object({
    email: z.string().email('Please enter a valid university .edu email'),
  }),
};

router.get('/:id', UserController.getProfile);
router.put('/profile', authenticateJWT, UserController.updateProfile);
router.get('/:id/listings', UserController.getUserListings);
router.post('/verify-edu', authenticateJWT, validateRequest(verifyEduSchema), UserController.verifyEdu);

export default router;
