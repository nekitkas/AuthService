import express from 'express';
import userRoutes from './user.ts';
import tokenRoutes from './token.ts';

export const router = express.Router();

router.use('/user', userRoutes);
router.use('/token', tokenRoutes);
