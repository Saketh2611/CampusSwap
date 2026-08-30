import { Router } from 'express';
import { z } from 'zod';
import { ListingController } from '../controllers/listingController';
import { authenticateJWT, optionalAuthJWT } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

const createListingSchema = {
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(5, 'Description must be at least 5 characters'),
    price: z.number().min(0, 'Price must be 0 or higher'),
    originalPrice: z.number().optional(),
    category: z.string().min(1, 'Category is required'),
    condition: z.enum(['Brand New', 'Like New', 'Good', 'Fair']).optional(),
    images: z.array(z.string()).optional(),
    campus: z.string().optional(),
    pickupLocation: z.string().min(2, 'Pickup location is required'),
    isNegotiable: z.boolean().optional(),
  }),
};

const updateStatusSchema = {
  body: z.object({
    status: z.enum(['active', 'pending', 'sold']),
    buyerId: z.number().optional(),
  }),
};

// Public / optionally authed listings retrieval
router.get('/', optionalAuthJWT, ListingController.getAll);
router.get('/favorites', authenticateJWT, ListingController.getFavorites);
router.get('/:id', optionalAuthJWT, ListingController.getById);

// Protected routes
router.post('/', authenticateJWT, validateRequest(createListingSchema), ListingController.create);
router.put('/:id', authenticateJWT, ListingController.update);
router.delete('/:id', authenticateJWT, ListingController.delete);
router.post('/:id/favorite', authenticateJWT, ListingController.toggleFavorite);
router.put('/:id/status', authenticateJWT, validateRequest(updateStatusSchema), ListingController.updateStatus);

export default router;
