import { Router } from 'express';
import { register, login, refresh, logout, me } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { authLimiter, refreshLimiter } from '../middlewares/rateLimiter';
import { validateBody } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema } from '../validators';

const router = Router();

router.post('/register', authLimiter, validateBody(registerSchema), register);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.post('/refresh', refreshLimiter, refresh);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

export default router;
