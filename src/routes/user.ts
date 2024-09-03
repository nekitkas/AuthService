import { Router } from 'express';
import { createUser, logIn, profile } from '../controllers/user.ts';
import { verifyTokenMW } from '../middleware/token.ts';

const router = Router();

router.post('/register', createUser);
router.post('/login', logIn);
router.get('/profile', verifyTokenMW, profile);

export default router;
