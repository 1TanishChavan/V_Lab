import { Request, Response, NextFunction } from 'express';
import redis from '../config/redis';
import { AppError } from '../utils/errors';

interface RateLimitOptions {
    windowMs: number;
    max: number;
    keyGenerator?: (req: Request) => string;
}

export const createRateLimiter = (options: RateLimitOptions) => {
    const {
        windowMs,
        max,
        keyGenerator = (req: Request) => {
            const userId = req.user?.user_id || 'anonymous';
            return `ratelimit:${req.path}:${userId}`;
        }
    } = options;

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const key = keyGenerator(req);

            const current = await redis.get(key);
            if (!current) {
                await redis.set(key, '1', { EX: Math.floor(windowMs / 1000) });
                return next();
            }

            const count = parseInt(current, 10);
            if (count >= max) {
                throw new AppError(429, 'Too many requests, please try again later');
            }

            await redis.set(key, (count + 1).toString(), {
                KEEPTTL: true // Keep the existing TTL
            });

            next();
        } catch (error) {
            if (error instanceof AppError) {
                next(error);
            } else {
                // If Redis fails, we'll let the request through
                console.error('Rate limit check failed:', error);
                next();
            }
        }
    };
};
