import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { config } from "./config";
import mongoose from "mongoose";

// Custom error interface
interface CustomError extends Error {
    status?: number;
}

// MongoDB Connection Configuration
const MONGODB_URI = "mongodb+srv://thanperfect:CuW54NNNFKnGQtt6@doneisbetter.49s2z.mongodb.net/doneisbetter?retryWrites=true&w=majority";
const MONGODB_OPTIONS = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
};

// Database connection with retry logic
const connectWithRetry = async (retries = 5, delay = 5000) => {
    for (let i = 0; i < retries; i++) {
        try {
            await mongoose.connect(MONGODB_URI, MONGODB_OPTIONS);
            console.log('Connected to MongoDB successfully');
            return;
        } catch (error: any) {
            console.error(`MongoDB connection attempt ${i + 1} failed:`, error.message);
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};


// Function to insert initial data
const insertInitialCards = async () => {
    try {
        const cards = await Card.create([
            { title: "future" },
            { title: "present" },
            { title: "past" }
        ]);
        console.log('Initial cards created successfully:', cards);
    } catch (error: unknown) {
        console.error('Error creating initial cards:', error);
        throw error instanceof Error ? error : new Error('Failed to create initial cards');
    }
};

// Connect to MongoDB and initialize data
const initializeDatabase = async () => {
    try {
        await connectWithRetry();
        const cardCount = await Card.countDocuments();
        if (cardCount === 0) {
            await insertInitialCards();
        }
    } catch (error: unknown) {
        console.error('Database initialization error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Details:', errorMessage);
        process.exit(1);
    }
};

initializeDatabase();

// Card Schema
const cardSchema = new mongoose.Schema({
title: { type: String, required: true },
createdAt: { type: Date, default: Date.now }
});

const Card = mongoose.model('Card', cardSchema);

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());
// Card endpoints
app.post("/api/cards", async (req: Request, res: Response) => {
    try {
        if (!req.body.title || typeof req.body.title !== 'string') {
            return res.status(400).json({ error: "Title is required and must be a string" });
        }
        const card = new Card({ title: req.body.title.trim() });
        await card.save();
        console.log('Card created successfully:', card);
        res.status(201).json(card);
    } catch (error: unknown) {
        console.error('Error creating card:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(400).json({ error: "Failed to create card", details: errorMessage });
    }
});

app.get("/api/cards", async (req: Request, res: Response) => {
    try {
        const cards = await Card.find().sort({ createdAt: -1 });
        res.json(cards);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch cards" });
    }
});

// Root endpoint - API information
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Welcome to the API",
        version: "1.0.0",
        endpoints: {
            "/": "API information (this endpoint)",
            "/health": "Health check status",
            "/api/cards": "Card management endpoints"
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
// Initial data insertion
const insertInitialData = async () => {
    try {
        const count = await Card.countDocuments();
        if (count === 0) {
            await Card.create({ title: "Welcome to Done Is Better!" });
            console.log("Initial card created");
        }
    } catch (error) {
        console.error("Failed to insert initial data:", error);
    }
};

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
    insertInitialData();
});

export default app;
