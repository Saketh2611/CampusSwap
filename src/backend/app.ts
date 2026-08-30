import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes';
import listingRoutes from './routes/listingRoutes';
import userRoutes from './routes/userRoutes';
import messageRoutes from './routes/messageRoutes';
import reviewRoutes from './routes/reviewRoutes';
import campusRoutes, { notificationRouter } from './routes/campusRoutes';

import { requestLogger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import { setupSwagger } from './docs/swagger';
import { seedDatabase } from './seed/seedData';

export const createApp = async (): Promise<Express> => {
  const app = express();

  // Initialize DB & Seed Data
  await seedDatabase();

  // Security Middleware
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows Vite dev scripts and inline assets in dev mode
      crossOriginEmbedderPolicy: false,
    })
  );

  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  // Rate limiter for API routes
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Max 1000 requests per window for active app usage
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  });

  app.use('/api', apiLimiter);

  // Body Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Structured Logging
  app.use(requestLogger);

  // API Documentation (Swagger / OpenAPI)
  setupSwagger(app);

  // Health Check Endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      app: 'CampusSwap Hyperlocal Marketplace API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/listings', listingRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/conversations', messageRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/campuses', campusRoutes);
  app.use('/api/notifications', notificationRouter);

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
};

export default createApp;
