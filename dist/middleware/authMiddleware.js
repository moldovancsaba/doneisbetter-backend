"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.requireAdmin = exports.requireAuth = exports.validateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Environment variables - would typically come from config
// Using Buffer for JWT_SECRET to ensure compatibility with jwt.sign/verify
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '1d';
/**
 * Validates a JWT token and attaches the user payload to the request
 */
const validateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.currentUser = undefined;
        next();
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, Buffer.from(JWT_SECRET, 'utf-8'));
        req.currentUser = payload;
        next();
    }
    catch (error) {
        req.currentUser = undefined;
        next();
    }
};
exports.validateToken = validateToken;
/**
 * Middleware to require authentication for protected routes
 */
const requireAuth = (req, res, next) => {
    if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    next();
};
exports.requireAuth = requireAuth;
/**
 * Middleware to require admin role for admin-only routes
 */
const requireAdmin = (req, res, next) => {
    if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    if (req.currentUser.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    next();
};
exports.requireAdmin = requireAdmin;
/**
 * Generates a JWT token for a user
 */
const generateToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role
    };
    // Ensure JWT_SECRET is treated as a string
    return jsonwebtoken_1.default.sign(payload, Buffer.from(JWT_SECRET, 'utf-8'), { expiresIn: TOKEN_EXPIRY });
};
exports.generateToken = generateToken;
//# sourceMappingURL=authMiddleware.js.map