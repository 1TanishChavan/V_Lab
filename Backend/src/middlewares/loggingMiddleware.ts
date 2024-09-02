import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    // Clone the original json method
    const originalJson = res.json;

    // Override the json method
    res.json = function (body) {
        (res as any).body = body;
        return originalJson.apply(res, arguments as any);
    };

    res.on('data', () => {
        const duration = Date.now() - start;
        let responseBody = (res as any).body;

        // If the response body is an object, stringify it
        if (typeof responseBody === 'object') {
            responseBody = JSON.stringify(responseBody);
        }

        logger.info('Request: ', {
            method: req.method,
            url: req.originalUrl,
            duration: `${duration}ms`,
            status: res.statusCode,
            requestBody: JSON.stringify(req.body),
        });
    });

    res.on('finish', () => {
        const duration = Date.now() - start;
        let responseBody = (res as any).body;

        // If the response body is an object, stringify it
        if (typeof responseBody === 'object') {
            responseBody = JSON.stringify(responseBody);
        }

        logger.info('Request processed', {
            method: req.method,
            url: req.originalUrl,
            duration: `${duration}ms`,
            status: res.statusCode,
            requestBody: JSON.stringify(req.body),
            responseBody: responseBody
        });
    });

    next();
}