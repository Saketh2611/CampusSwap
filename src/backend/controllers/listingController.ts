import { Request, Response, NextFunction } from 'express';
import { ListingService } from '../services/listingService';
import { AuthRequest } from '../middleware/auth';

export class ListingController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user?.id;
      const result = await ListingService.getAll(req.query, currentUserId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const currentUserId = req.user?.id;
      const listing = await ListingService.getById(id, currentUserId);
      res.status(200).json({
        success: true,
        data: listing,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      const listing = await ListingService.create(req.body, req.user.id);
      res.status(201).json({
        success: true,
        message: 'Listing posted successfully to campus marketplace',
        data: listing,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      const id = Number(req.params.id);
      const listing = await ListingService.update(id, req.body, req.user.id);
      res.status(200).json({
        success: true,
        message: 'Listing updated successfully',
        data: listing,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      const id = Number(req.params.id);
      const result = await ListingService.delete(id, req.user.id);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  static async toggleFavorite(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      const id = Number(req.params.id);
      const result = await ListingService.toggleFavorite(id, req.user.id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getFavorites(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      const favorites = await ListingService.getFavorites(req.user.id);
      res.status(200).json({
        success: true,
        data: favorites,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      const id = Number(req.params.id);
      const { status, buyerId } = req.body;
      const listing = await ListingService.markStatus(id, status, req.user.id, buyerId);
      res.status(200).json({
        success: true,
        message: `Listing marked as ${status}`,
        data: listing,
      });
    } catch (error) {
      next(error);
    }
  }
}
