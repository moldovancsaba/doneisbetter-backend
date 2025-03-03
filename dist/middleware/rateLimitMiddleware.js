"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSpecificRateLimiter = exports.rateLimitMiddleware = exports.checkBlockedIP = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Default rate limit values - these can be overridden by environment variables
const DEFAULT_ANONYMOUS_MAX_REQUESTS = 50;
const DEFAULT_AUTHENTICATED_MAX_REQUESTS = 100;
const DEFAULT_WINDOW_MINUTES = 10;
const DEFAULT_BLOCK_DURATION_HOURS = 24;
const DEFAULT_ABUSE_THRESHOLD = 5;
// Get rate limit values from environment variables, or use defaults
const anonymousMaxRequests = Number(process.env.ANONYMOUS_MAX_REQUESTS) || DEFAULT_ANONYMOUS_MAX_REQUESTS;
const authenticatedMaxRequests = Number(process.env.AUTHENTICATED_MAX_REQUESTS) || DEFAULT_AUTHENTICATED_MAX_REQUESTS;
const windowMinutes = Number(process.env.RATE_LIMIT_WINDOW_MINUTES) || DEFAULT_WINDOW_MINUTES;
const blockDurationHours = Number(process.env.ABUSIVE_IP_BLOCK_DURATION_HOURS) || DEFAULT_BLOCK_DURATION_HOURS;
const abuseThreshold = Number(process.env.ABUSE_THRESHOLD) || DEFAULT_ABUSE_THRESHOLD;
// In-memory storage for blocked IPs (in production, this should be in a database)
const blockedIPs = new Map();
// Middleware to check if IP is blocked
const checkBlockedIP = (req, res, next) => {
    const ip = req.ip;
    if (blockedIPs.has(ip)) {
        const blockedIP = blockedIPs.get(ip);
        const now = new Date();
        // If block period has expired, remove from blocked list
        if (now > blockedIP.blockedUntil) {
            blockedIPs.delete(ip);
        }
        else {
            return res.status(429).json({
                message: 'Too many requests, IP has been temporarily blocked',
                blockedUntil: blockedIP.blockedUntil
            });
        }
    }
    next();
};
exports.checkBlockedIP = checkBlockedIP;
// Function to block an abusive IP
const blockIP = (ip) => {
    var _a;
    let blockedIP = blockedIPs.get(ip);
    if (blockedIP) {
        // Increment abuse count and extend block duration for repeat offenders
        blockedIP.abuse_count += 1;
        const multiplier = Math.min(blockedIP.abuse_count, 10); // Cap at 10x penalty
        const blockDuration = blockDurationHours * multiplier;
        blockedIP.blockedUntil = new Date(Date.now() + blockDuration * 60 * 60 * 1000);
        blockedIPs.set(ip, blockedIP);
    }
    else {
        // First-time block
        blockedIPs.set(ip, {
            ip,
            blockedUntil: new Date(Date.now() + blockDurationHours * 60 * 60 * 1000),
            abuse_count: 1
        });
    }
    console.log(`IP ${ip} blocked until ${(_a = blockedIPs.get(ip)) === null || _a === void 0 ? void 0 : _a.blockedUntil}`);
    // In a real application, you would save this to a database
    // For MongoDB implementation:
    // await BlockedIPModel.findOneAndUpdate(
    //   { ip },
    //   { ip, blockedUntil, abuse_count: (blockedIP?.abuse_count || 0) + 1 },
    //   { upsert: true }
    // );
};
// Handler for when rate limit is exceeded
const onLimitReached = (req, res, options) => {
    const ip = req.ip;
    // Check if this IP has exceeded the limit multiple times
    let blockedIP = blockedIPs.get(ip);
    const abuseCount = blockedIP ? blockedIP.abuse_count : 0;
    if (abuseCount >= abuseThreshold - 1) {
        // Block the IP if it repeatedly exceeds the rate limit
        blockIP(ip);
    }
    else {
        // Track the IP for potential future blocking
        blockedIPs.set(ip, {
            ip,
            blockedUntil: new Date(Date.now() + windowMinutes * 60 * 1000),
            abuse_count: abuseCount + 1
        });
    }
};
// Create different rate limiters for anonymous and authenticated users
const anonymousLimiter = (0, express_rate_limit_1.default)({
    windowMs: windowMinutes * 60 * 1000,
    max: anonymousMaxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        onLimitReached(req, res, options);
        res.status(429).json({
            message: 'Too many requests from this IP, please try again later',
            retryAfter: Math.ceil(windowMinutes * 60)
        });
    }
});
const authenticatedLimiter = (0, express_rate_limit_1.default)({
    windowMs: windowMinutes * 60 * 1000,
    max: authenticatedMaxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        onLimitReached(req, res, options);
        res.status(429).json({
            message: 'Too many requests from this IP, please try again later',
            retryAfter: Math.ceil(windowMinutes * 60)
        });
    }
});
// Middleware that applies different rate limits based on authentication status
const rateLimitMiddleware = (req, res, next) => {
    // First check if IP is already blocked
    (0, exports.checkBlockedIP)(req, res, (err) => {
        if (err)
            return next(err);
        // Apply appropriate rate limiter based on authentication status
        // We check req.user as this is typically where Express-based auth systems store the user
        if (req.user) {
            authenticatedLimiter(req, res, next);
        }
        else {
            anonymousLimiter(req, res, next);
        }
    });
};
exports.rateLimitMiddleware = rateLimitMiddleware;
// Export for applying to specific API groups or routes
const createSpecificRateLimiter = (max, windowMs = windowMinutes * 60 * 1000) => {
    return (0, express_rate_limit_1.default)({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res, next, options) => {
            onLimitReached(req, res, options);
            res.status(429).json({
                message: 'Too many requests for this specific API, please try again later',
                retryAfter: Math.ceil(windowMs / 1000)
            });
        }
    });
};
exports.createSpecificRateLimiter = createSpecificRateLimiter;
