import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Types
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

// Environment variables - would typically come from config
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '1d';

/**
 * Validates a JWT token and attaches the user payload to the request
 */
export const validateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.currentUser = undefined;
    return next();
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const payload = jwt.verify(token, JWT_SECRET) as UserPayload;
    req.currentUser = payload;
    next();
  } catch (error) {
    req.currentUser = undefined;
    next();
  }
};

/**
 * Middleware to require authentication for protected routes
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): Response | void => {
  if (!req.currentUser) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  
  next();
};

/**
 * Middleware to require admin role for admin-only routes
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): Response | void => {
  if (!req.currentUser) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  
  if (req.currentUser.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  
  next();
};

/**
 * Generates a JWT token for a user
 */
export const generateToken = (user: { id: string; email: string; role: string }): string => {
  const payload: UserPayload = {
    id: user.id,
    email: user.email,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
};

