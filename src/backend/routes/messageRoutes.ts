import { Router } from 'express';
import { z } from 'zod';
import { MessageController } from '../controllers/messageController';
import { authenticateJWT } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

const startConversationSchema = {
  body: z.object({
    listingId: z.number(),
    initialMessage: z.string().optional(),
  }),
};

const sendMessageSchema = {
  body: z.object({
    text: z.string().min(1, 'Message cannot be empty'),
    messageType: z.enum(['text', 'offer', 'meetup_proposal', 'system']).optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  }),
};

router.get('/', authenticateJWT, MessageController.getConversations);
router.post('/start', authenticateJWT, validateRequest(startConversationSchema), MessageController.startConversation);
router.get('/:conversationId', authenticateJWT, MessageController.getMessages);
router.post('/:conversationId/messages', authenticateJWT, validateRequest(sendMessageSchema), MessageController.sendMessage);

export default router;
