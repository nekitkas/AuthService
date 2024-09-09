import type { Request, Response, NextFunction } from 'express';

export const log = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const currentTime = new Date().toTimeString()
    console.log(`[${currentTime}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms ${req.ip} "${req.headers['user-agent']}"`);
  });

  next();
}