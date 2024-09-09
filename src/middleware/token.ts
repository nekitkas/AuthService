import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

export interface TokenPayload {
  userId: string,
}

export const verifyTokenMW = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token = req.cookies.accessToken;
  if (!token) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const payload= jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as TokenPayload;
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};