import { Router } from 'express';
import { chatWithAI } from '../controllers/ai.controller';
import { aiLimiter } from '../middlewares/rateLimiter';
import { validateBody } from '../middlewares/validate.middleware';
import { aiChatSchema } from '../validators';

const router = Router();

router.post('/chat', aiLimiter, validateBody(aiChatSchema), chatWithAI);

export default router;
