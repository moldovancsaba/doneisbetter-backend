import { Request, Response, NextFunction } from 'express';
interface UserPayload {
    id: string;
    email: string;
    role: string;
}
declare global {
    namespace Express {
        interface Request {
            currentUser?: UserPayload;
        }
    }
}
/**
 * Validates a JWT token and attaches the user payload to the request
 */
export declare const validateToken: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware to require authentication for protected routes
 */
export declare const requireAuth: (req: Request, res: Response, next: NextFunction) => Response | void;
/**
 * Middleware to require admin role for admin-only routes
 */
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => Response | void;
/**
 * Generates a JWT token for a user
 */
export declare const generateToken: (user: {
    id: string;
    email: string;
    role: string;
}) => string;
export {};
