import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { config } from "./config";

const app = express();

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        console.log('Incoming request from origin:', origin);
        if (!origin || config.cors.origins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('Origin not allowed:', origin);
            console.log('Allowed origins:', config.cors.origins);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: config.cors.methods,
    allowedHeaders: config.cors.allowedHeaders,
    credentials: true
}));
app.use(express.json());

// Root endpoint - API information
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Welcome to the API",
        version: "1.0.0",
        endpoints: {
            "/": "API information (this endpoint)",
            "/health": "Health check status"
        },
        serverTime: new Date().toISOString()
    });
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
interface CustomError extends Error {
    status?: number;
}

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    const status = err.status || 500;
    res.status(status).json({
        error: {
            message: err.message || "Internal Server Error",
            status: status
        }
    });
});

// Start server
app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});

export default app;
