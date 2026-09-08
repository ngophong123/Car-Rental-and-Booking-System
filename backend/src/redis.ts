import Redis from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';

// Nạp biến môi trường từ .env
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    // Giãn cách thử kết nối lại (1s -> 5s) tránh làm nghẽn terminal
    return Math.min(times * 1000, 5000);
  },
});

let isLoggedError = false;

redis.on('connect', () => {
  isLoggedError = false;
  console.log('✅ Connected to Redis successfully');
});

redis.on('error', (err: any) => {
  if (!isLoggedError) {
    console.error(`❌ Redis connection error: ${err.code || err.message || 'ECONNREFUSED'}`);
    console.warn(`👉 Kiểm tra: Đang kết nối tới "${redisUrl}". Nếu chạy local, hãy đảm bảo Docker Desktop đang bật ("docker compose up -d redis") hoặc dùng REDIS_URL từ Upstash/Cloud.`);
    isLoggedError = true;
  }
});

export const redisClient = redis;
export { redis };
export default redis;
