import { Router } from 'express';
import { refreshToken, revokeToken } from '../controllers/token.ts';

const router = Router();

router.get('/refresh', refreshToken);
router.get('/revoke', revokeToken);

export default router;
