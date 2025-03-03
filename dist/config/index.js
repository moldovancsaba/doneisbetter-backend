"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
// Load environment variables from .env file
dotenv_1.default.config();
// Define the schema for configuration validation
const configSchema = zod_1.z.object({
    // Server configuration
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().positive().default(3000),
    // MongoDB configuration
    MONGODB_URI: zod_1.z.string().nonempty({
        message: 'MongoDB connection string is required',
    }).default('mongodb+srv://thanperfect:CuW54NNNFKnGQtt6@doneisbetter.49s2z.mongodb.net/?retryWrites=true&w=majority&appName=doneisbetter'),
    // Rate limiting configuration - Anonymous users
    RATE_LIMIT_ANONYMOUS_MAX: zod_1.z.coerce.number().positive().default(50),
    RATE_LIMIT_ANONYMOUS_WINDOW_MINUTES: zod_1.z.coerce.number().positive().default(10),
    // Rate limiting configuration - Authenticated users
    RATE_LIMIT_AUTHENTICATED_MAX: zod_1.z.coerce.number().positive().default(100),
    RATE_LIMIT_AUTHENTICATED_WINDOW_MINUTES: zod_1.z.coerce.number().positive().default(10),
    // Abusive IP blocking configuration
    ABUSIVE_IP_BLOCK_DURATION_HOURS: zod_1.z.coerce.number().positive().default(24),
    ABUSIVE_IP_VIOLATION_THRESHOLD: zod_1.z.coerce.number().positive().default(3),
    // Socket.io configuration
    SOCKET_CORS_ORIGIN: zod_1.z.string().default('*'),
    // ImgBB API configuration
    IMGBB_API_KEY: zod_1.z.string().default('9285b95f2c425d764a48cf047e772c1f'),
    IMGBB_API_URL: zod_1.z.string().default('https://api.imgbb.com/1/upload'),
    // Soft delete configuration
    SOFT_DELETE_RETENTION_DAYS: zod_1.z.coerce.number().positive().default(1000),
    // JWT Secret for authentication
    JWT_SECRET: zod_1.z.string().nonempty({
        message: 'JWT secret is required for authentication',
    }).default('default-jwt-secret-change-in-production'),
    // Deployment URLs
    PRODUCTION_URL: zod_1.z.string().default('https://doneisbetter.com'),
    STAGING_URL: zod_1.z.string().default('https://staging.doneisbetter.com'),
    // API groups rate limiting (optional, for specific API groups)
    ENABLE_API_GROUP_RATE_LIMITING: zod_1.z.coerce.boolean().default(false),
});
// Load and validate configuration
let config;
try {
    config = configSchema.parse({
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        MONGODB_URI: process.env.MONGODB_URI,
        RATE_LIMIT_ANONYMOUS_MAX: process.env.RATE_LIMIT_ANONYMOUS_MAX,
        RATE_LIMIT_ANONYMOUS_WINDOW_MINUTES: process.env.RATE_LIMIT_ANONYMOUS_WINDOW_MINUTES,
        RATE_LIMIT_AUTHENTICATED_MAX: process.env.RATE_LIMIT_AUTHENTICATED_MAX,
        RATE_LIMIT_AUTHENTICATED_WINDOW_MINUTES: process.env.RATE_LIMIT_AUTHENTICATED_WINDOW_MINUTES,
        ABUSIVE_IP_BLOCK_DURATION_HOURS: process.env.ABUSIVE_IP_BLOCK_DURATION_HOURS,
        ABUSIVE_IP_VIOLATION_THRESHOLD: process.env.ABUSIVE_IP_VIOLATION_THRESHOLD,
        SOCKET_CORS_ORIGIN: process.env.SOCKET_CORS_ORIGIN,
        IMGBB_API_KEY: process.env.IMGBB_API_KEY,
        IMGBB_API_URL: process.env.IMGBB_API_URL,
        SOFT_DELETE_RETENTION_DAYS: process.env.SOFT_DELETE_RETENTION_DAYS,
        JWT_SECRET: process.env.JWT_SECRET,
        PRODUCTION_URL: process.env.PRODUCTION_URL,
        STAGING_URL: process.env.STAGING_URL,
        ENABLE_API_GROUP_RATE_LIMITING: process.env.ENABLE_API_GROUP_RATE_LIMITING,
    });
}
catch (error) {
    if (error instanceof zod_1.z.ZodError) {
        console.error('❌ Configuration validation failed:', error.errors);
        process.exit(1);
    }
    throw error;
}
// Derived configurations
const isDevelopment = config.NODE_ENV === 'development';
const isProduction = config.NODE_ENV === 'production';
const isTest = config.NODE_ENV === 'test';
// Rate limiting configurations
const rateLimitConfig = {
    anonymous: {
        max: config.RATE_LIMIT_ANONYMOUS_MAX,
        windowMs: config.RATE_LIMIT_ANONYMOUS_WINDOW_MINUTES * 60 * 1000, // Convert minutes to milliseconds
    },
    authenticated: {
        max: config.RATE_LIMIT_AUTHENTICATED_MAX,
        windowMs: config.RATE_LIMIT_AUTHENTICATED_WINDOW_MINUTES * 60 * 1000, // Convert minutes to milliseconds
    },
};
// Abusive IP blocking configuration
const abusiveIpConfig = {
    blockDurationMs: config.ABUSIVE_IP_BLOCK_DURATION_HOURS * 60 * 60 * 1000, // Convert hours to milliseconds
    violationThreshold: config.ABUSIVE_IP_VIOLATION_THRESHOLD,
};
// Export the configuration
exports.default = {
    ...config,
    isDevelopment,
    isProduction,
    isTest,
    rateLimitConfig,
    abusiveIpConfig,
};
