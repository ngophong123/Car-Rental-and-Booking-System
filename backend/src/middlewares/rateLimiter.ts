import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redisClient } from '../redis';

// Helper to safely issue Redis commands with fallback to avoid crashing requests if Redis is unreachable
const createSafeRedisStore = (prefix: string) => {
  try {
    return new RedisStore({
      sendCommand: async (...args: string[]) => {
        try {
          return await (redisClient as any).call(...args);
        } catch (err) {
          // Gracefully let the request proceed if Redis is momentarily unreachable
          return null;
        }
      },
      prefix: `rl:${prefix}:`
    });
  } catch (err) {
    return undefined; // Falls back to default in-memory store
  }
};

// Limiter for authentication routes (Login/Register)
export const authLimiter = rateLimit({
  store: createSafeRedisStore('auth'),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 attempts per 15 minutes
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu xác thực từ IP này. Vui lòng thử lại sau 15 phút.',
    data: null
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter for token refresh
export const refreshLimiter = rateLimit({
  store: createSafeRedisStore('refresh'),
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu làm mới phiên đăng nhập. Vui lòng thử lại sau.',
    data: null
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter for booking creation
export const bookingLimiter = rateLimit({
  store: createSafeRedisStore('booking'),
  windowMs: 15 * 60 * 1000,
  max: 15, // Max 15 booking creations per 15 min per IP
  message: {
    success: false,
    message: 'Bạn đã tạo quá nhiều lượt đặt chuyến trong thời gian ngắn. Vui lòng đợi trong giây lát!',
    data: null
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter for AI chatbot
export const aiLimiter = rateLimit({
  store: createSafeRedisStore('ai'),
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // 30 messages per 10 mins
  message: {
    success: false,
    message: 'Bạn đã gửi tin nhắn quá nhanh. Vui lòng chờ vài phút trước khi trò chuyện tiếp với AI.',
    data: null
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter for payments
export const paymentLimiter = rateLimit({
  store: createSafeRedisStore('payment'),
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Quá nhiều thao tác thanh toán từ IP này. Vui lòng kiểm tra lại trạng thái đơn hàng.',
    data: null
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limiter
export const apiLimiter = rateLimit({
  store: createSafeRedisStore('general'),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  message: {
    success: false,
    message: 'Hệ thống nhận thấy quá nhiều truy vấn từ địa chỉ của bạn. Vui lòng thử lại sau.',
    data: null
  },
  standardHeaders: true,
  legacyHeaders: false,
});
