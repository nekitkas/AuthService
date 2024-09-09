import express from 'express';
import userRoutes from './user';
import tokenRoutes from './token';

export const router = express.Router();

router.use('/user', userRoutes);
router.use('/token', tokenRoutes);
