import { Router } from 'express';
import { createUser, logIn, profile } from '../controllers/user';
import { verifyTokenMW } from '../middleware/token';

const router = Router();

router.post('/register', createUser);
router.post('/login', logIn);
router.get('/profile', verifyTokenMW, profile);

export default router;
