import jwt from 'jsonwebtoken';
import redis from '../utils/redis';
import type { Request, Response } from 'express';
import {
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
} from '../constants/constants';
import type { TokenPayload } from '../middleware/token';
import prisma from '../utils/prisma';

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required' });
  }

  try {
    const payload: TokenPayload = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as TokenPayload;
    const key = 'refreshToken:' + payload.userId;
    const storedToken = await redis.get(key);
    if (storedToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const accessToken = jwt.sign(
      { userId: payload.userId },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: ACCESS_TOKEN_EXPIRY.seconds }
    );
    const newRefreshToken = jwt.sign(
      { userId: payload.userId },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: REFRESH_TOKEN_EXPIRY.seconds }
    );

    await redis.set(key, newRefreshToken, 'EX', REFRESH_TOKEN_EXPIRY.seconds);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: ACCESS_TOKEN_EXPIRY.millisecond,
    });
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: REFRESH_TOKEN_EXPIRY.millisecond,
    });

    res.status(200).json({ message: 'Token refreshed' });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const revokeToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required' });
  }

  try {
    const payload: TokenPayload = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as TokenPayload;
    const key = 'refreshToken:' + payload.userId;
    const storedToken = await redis.get(key);
    if (storedToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    await redis.del(key);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Token revoked' });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
