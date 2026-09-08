import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redisClient } from '../redis';

// Limiter for authentication routes (Login/Register)
export const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: ((...args: string[]) => (redisClient as any).call(...args)) as any,
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    data: null
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// General API limiter
export const apiLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: ((...args: string[]) => (redisClient as any).call(...args)) as any,
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    data: null
  },
  standardHeaders: true,
  legacyHeaders: false,
});
