import { Router } from 'express';
import { CampusController, NotificationController } from '../controllers/campusController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/', CampusController.getCampuses);
router.get('/:id', CampusController.getCampusById);

export const notificationRouter = Router();
notificationRouter.get('/', authenticateJWT, NotificationController.getNotifications);
notificationRouter.put('/read-all', authenticateJWT, NotificationController.markAllRead);

export default router;
