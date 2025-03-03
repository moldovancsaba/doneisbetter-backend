import { Request, Response, NextFunction } from 'express';
import { RateLimitRequestHandler } from 'express-rate-limit';
export declare const checkBlockedIP: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const rateLimitMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const createSpecificRateLimiter: (max: number, windowMs?: number) => RateLimitRequestHandler;
