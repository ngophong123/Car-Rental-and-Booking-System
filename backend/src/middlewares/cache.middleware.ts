import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../redis';

export const cacheData = (prefix: string, ttl: number = 3600) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Create a unique key based on the prefix and the query parameters
      const key = `${prefix}:${req.originalUrl}`;
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        res.status(200).json(JSON.parse(cachedData));
        return;
      }

      // If not cached, we intercept res.json to cache the response before sending it
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        // Only cache if the request was successful
        if (body.success) {
          redisClient.setex(key, ttl, JSON.stringify(body));
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error('Redis cache error:', error);
      next();
    }
  };
};

export const clearCache = async (prefix: string) => {
  try {
    const stream = redisClient.scanStream({
      match: `${prefix}:*`,
      count: 100
    });
    stream.on('data', async (keys: string[]) => {
      if (keys.length > 0) {
        try {
          await redisClient.del(...keys);
        } catch (e) {
          // Ignore key deletion errors
        }
      }
    });
    stream.on('error', (err) => {
      console.warn('Redis clear cache scan error:', err);
    });
  } catch (error) {
    console.error('Redis clear cache error:', error);
  }
};
