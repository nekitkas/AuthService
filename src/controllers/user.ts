import prisma from '../utils/prisma';
import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';
import redis from '../utils/redis';
import {
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
} from '../constants/constants';
import bcrypt from 'bcrypt';

interface CreateUserRequest extends Request {
  body: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };
}

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

export const createUser = async (req: CreateUserRequest, res: Response) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    res.status(400).json({ message: 'Missing name, email or password' });
  }

  try {
    const hashedPassword = await bcrypt
      .hash(password, 10)
      .then((salt) => {
        return bcrypt.hash(password, salt);
      })
      .catch((error) => {
        res.status(500).json({ error: error });
      });

    const user = await prisma.user.create({
      data: {
        firstName: firstName,
        lastName: lastName,
        email: email,
        passwordHash: hashedPassword as string,
      },
    });
    res.json(user);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        res.status(400).json({ message: 'Email or username already exists' });
        return;
      }
      console.error(error.message);
      res.status(400).json({ error: error.message });
      return;
    }
  }
};

export const logIn = async (req: LoginRequest, res: Response): Promise<any> => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing email or password' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'No user with given email' });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: ACCESS_TOKEN_EXPIRY.seconds }
    );
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: REFRESH_TOKEN_EXPIRY.seconds }
    );
    const key = 'refreshToken:' + user.id;
    await redis.set(key, refreshToken, 'EX', REFRESH_TOKEN_EXPIRY.seconds);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: ACCESS_TOKEN_EXPIRY.millisecond,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: REFRESH_TOKEN_EXPIRY.millisecond,
    });

    res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

export const profile = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};
