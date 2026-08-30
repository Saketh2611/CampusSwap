import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const timestamp = new Date().toISOString();
    
    // Log in clean structured format
    if (!originalUrl.startsWith('/@vite') && !originalUrl.startsWith('/node_modules') && !originalUrl.startsWith('/src/')) {
      console.log(`[${timestamp}] ${method} ${originalUrl} -> ${statusCode} (${duration}ms) - Client IP: ${ip}`);
    }
  });

  next();
};
