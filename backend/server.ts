import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cardRoutes from './routes/cardRoutes';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI!)
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.use('/api/cards', cardRoutes);

// Basic root route
app.get('/', (req: Request, res: Response) => {
res.json({
    message: 'API is running',
    endpoints: {
    cards: {
        GET: '/api/cards',
        POST: '/api/cards',
    }
    }
});
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
console.error(err.stack);
res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
});
});

// Start server
app.listen(port, () => {
console.log(`Server is running on port ${port}`);
});

