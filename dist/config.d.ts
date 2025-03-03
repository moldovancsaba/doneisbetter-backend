declare const config: {
    server: {
        env: "development" | "production" | "test" | "staging";
        port: number;
        isDev: boolean;
        isProd: boolean;
        isTest: boolean;
        isStaging: boolean;
    };
    mongodb: {
        uri: string;
    };
    rateLimit: {
        authenticated: number;
        anonymous: number;
        windowMs: number;
        abusiveIpBlockDuration: number;
    };
    auth: {
        jwtSecret: string;
        jwtExpiresIn: string;
        google: {
            clientId: string | undefined;
            clientSecret: string | undefined;
        };
    };
    fileUpload: {
        imgbb: {
            apiKey: string;
            apiUrl: string;
            allowedFileTypes: string[];
            maxFileSize: number;
        };
    };
    softDelete: {
        retentionDays: number;
    };
};
export default config;
