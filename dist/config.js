"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
// Load environment variables from .env file
dotenv_1.default.config();
// Define schema for environment variables with validation
const envSchema = zod_1.z.object({
    // Server configuration
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test', 'staging']).default('development'),
    PORT: zod_1.z.string().default('3000'),
    // MongoDB configuration
    MONGODB_URI: zod_1.z.string().default('mongodb+srv://thanperfect:CuW54NNNFKnGQtt6@doneisbetter.49s2z.mongodb.net/?retryWrites=true&w=majority&appName=doneisbetter'),
    // Rate limiting configuration
    RATE_LIMIT_AUTHENTICATED: zod_1.z.string().default('100'), // requests per 10 minutes
    RATE_LIMIT_ANONYMOUS: zod_1.z.string().default('50'), // requests per 10 minutes
    RATE_LIMIT_WINDOW: zod_1.z.string().default('600000'), // 10 minutes in milliseconds
    ABUSIVE_IP_BLOCK_DURATION: zod_1.z.string().default('3600000'), // 1 hour in milliseconds
    // Authentication configuration
    JWT_SECRET: zod_1.z.string().default('your-jwt-secret-key-change-in-production'),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    GOOGLE_CLIENT_ID: zod_1.z.string().optional(),
    GOOGLE_CLIENT_SECRET: zod_1.z.string().optional(),
    // File upload configuration (ImgBB)
    IMGBB_API_KEY: zod_1.z.string().default('9285b95f2c425d764a48cf047e772c1f'),
    IMGBB_API_URL: zod_1.z.string().default('https://api.imgbb.com/1/upload'),
    // Soft delete configuration
    SOFT_DELETE_RETENTION_DAYS: zod_1.z.string().default('1000'),
});
// Parse environment variables with validation
const env = envSchema.parse(process.env);
// Export configuration object
const config = {
    server: {
        env: env.NODE_ENV,
        port: parseInt(env.PORT, 10),
        isDev: env.NODE_ENV === 'development',
        isProd: env.NODE_ENV === 'production',
        isTest: env.NODE_ENV === 'test',
        isStaging: env.NODE_ENV === 'staging',
    },
    mongodb: {
        uri: env.MONGODB_URI,
    },
    rateLimit: {
        authenticated: parseInt(env.RATE_LIMIT_AUTHENTICATED, 10),
        anonymous: parseInt(env.RATE_LIMIT_ANONYMOUS, 10),
        windowMs: parseInt(env.RATE_LIMIT_WINDOW, 10),
        abusiveIpBlockDuration: parseInt(env.ABUSIVE_IP_BLOCK_DURATION, 10),
    },
    auth: {
        jwtSecret: env.JWT_SECRET,
        jwtExpiresIn: env.JWT_EXPIRES_IN,
        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
    },
    fileUpload: {
        imgbb: {
            apiKey: env.IMGBB_API_KEY,
            apiUrl: env.IMGBB_API_URL,
            allowedFileTypes: ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'tif', 'tiff', 'webp', 'heic', 'avif', 'pdf'],
            maxFileSize: 32 * 1024 * 1024, // 32MB in bytes
        },
    },
    softDelete: {
        retentionDays: parseInt(env.SOFT_DELETE_RETENTION_DAYS, 10),
    },
};
exports.default = config;
//# sourceMappingURL=config.js.map