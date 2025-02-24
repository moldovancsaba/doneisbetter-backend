import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

interface Config {
    port: number;
    nodeEnv: string;
    cors: {
        origins: string[];
        methods: string[];
        allowedHeaders: string[];
    };
}

// Define allowed origins based on environment
const getAllowedOrigins = (nodeEnv: string): string[] => {
    const origins = [
        'https://doneisbetter.com',
        'https://www.doneisbetter.com',
        'https://doneisbetter.vercel.app',
        'https://backend.doneisbetter.com'
    ];
    
    // Include local development origins in non-production environments
    if (nodeEnv !== 'production') {
        origins.push(
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173'
        );
    }
    
    return origins;
};

export const config: Config = {
    port: parseInt(process.env.PORT || "3000", 10),
    nodeEnv: process.env.NODE_ENV || "development",
    cors: {
        origins: getAllowedOrigins(process.env.NODE_ENV || "development"),
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
    }
};
