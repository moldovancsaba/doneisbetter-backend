import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { cardsRouter } from './routes/cards';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
origin: 'http://localhost:5173', // Frontend URL
methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
allowedHeaders: ['Content-Type', 'Authorization'],
credentials: true
}));

// Middleware
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doneisbetter')
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {
    console.error('MongoDB connection error:', error);
});

// Routes
app.use('/api/cards', cardsRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
console.error(err.stack);
res.status(500).json({ message: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
console.log(`Server is running on port ${PORT}`);
});

