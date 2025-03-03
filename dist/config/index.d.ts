declare const _default: {
    isDevelopment: boolean;
    isProduction: boolean;
    isTest: boolean;
    rateLimitConfig: {
        anonymous: {
            max: number;
            windowMs: number;
        };
        authenticated: {
            max: number;
            windowMs: number;
        };
    };
    abusiveIpConfig: {
        blockDurationMs: number;
        violationThreshold: number;
    };
    NODE_ENV?: "development" | "production" | "test";
    PORT?: number;
    MONGODB_URI?: string;
    JWT_SECRET?: string;
    IMGBB_API_KEY?: string;
    IMGBB_API_URL?: string;
    SOFT_DELETE_RETENTION_DAYS?: number;
    RATE_LIMIT_ANONYMOUS_MAX?: number;
    RATE_LIMIT_ANONYMOUS_WINDOW_MINUTES?: number;
    RATE_LIMIT_AUTHENTICATED_MAX?: number;
    RATE_LIMIT_AUTHENTICATED_WINDOW_MINUTES?: number;
    ABUSIVE_IP_BLOCK_DURATION_HOURS?: number;
    ABUSIVE_IP_VIOLATION_THRESHOLD?: number;
    SOCKET_CORS_ORIGIN?: string;
    PRODUCTION_URL?: string;
    STAGING_URL?: string;
    ENABLE_API_GROUP_RATE_LIMITING?: boolean;
};
export default _default;
