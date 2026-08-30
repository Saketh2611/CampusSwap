import { Response, NextFunction } from 'express';
import { MessageService } from '../services/messageService';
import { AuthRequest } from '../middleware/auth';

export class MessageController {
  static async getConversations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      const conversations = await MessageService.getUserConversations(req.user.id);
      res.status(200).json({
        success: true,
        data: conversations,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMessages(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      const conversationId = Number(req.params.conversationId);
      const data = await MessageService.getConversationMessages(conversationId, req.user.id);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async startConversation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      const { listingId, initialMessage } = req.body;
      const data = await MessageService.startOrGetConversation(Number(listingId), req.user.id, initialMessage);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async sendMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      const conversationId = Number(req.params.conversationId);
      const { text, messageType, metadata } = req.body;
      const message = await MessageService.sendMessage(conversationId, req.user.id, text, messageType, metadata);
      res.status(201).json({
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }
}
