import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load environment variables
dotenv.config();

// Import models
import './models/User';
import './models/Message';

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://doneisbetter.com', 'https://staging.doneisbetter.com'] 
      : 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://doneisbetter.com', 'https://staging.doneisbetter.com'] 
    : 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());
app.use(compression());

// Define rate limiters
const anonymousLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50, // 50 requests per 10 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 10 minutes'
})

const authenticatedLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // 100 requests per 10 minutes for authenticated users
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 10 minutes'
});

// Basic Hello World route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World');
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  const startTime = Date.now();
  
  // Create health check schema with Zod
  const HealthCheckSchema = z.object({
    server: z.string(),
    database: z.string(),
    responseTime: z.number(),
    timestamp: z.string(),
    activeUsers: z.number(),
    socketStatus: z.string()
  });
  
  const healthData = {
    server: 'Running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    responseTime: Date.now() - startTime,
    timestamp: new Date().toISOString(),
    activeUsers: io.engine.clientsCount,
    socketStatus: io.engine.clientsCount > 0 ? 'Connected' : 'No Active Connections'
  };
  
  try {
    // Validate with Zod
    const validatedData = HealthCheckSchema.parse(healthData);
    res.json(validatedData);
  } catch (error) {
    res.status(500).json({ error: 'Health check validation failed' });
  }
});

// Public health check endpoint - accessible without authentication
app.get('/api/public-health', (req: Request, res: Response) => {
  const startTime = Date.now();
  
  // Create health check schema with Zod
  const HealthCheckSchema = z.object({
    server: z.string(),
    database: z.string(),
    responseTime: z.number(),
    timestamp: z.string(),
    activeUsers: z.number(),
    socketStatus: z.string()
  });
  
  const healthData = {
    server: 'Running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    responseTime: Date.now() - startTime,
    timestamp: new Date().toISOString(),
    activeUsers: io.engine.clientsCount,
    socketStatus: io.engine.clientsCount > 0 ? 'Connected' : 'No Active Connections'
  };
  
  try {
    // Validate with Zod
    const validatedData = HealthCheckSchema.parse(healthData);
    res.json(validatedData);
  } catch (error) {
    res.status(500).json({ error: 'Health check validation failed' });
  }
});

// Apply rate limiting based on auth status
app.use((req: Request, res: Response, next: NextFunction) => {
  // Simple auth check - would be replaced with actual auth middleware
  if (req.headers.authorization) {
    return authenticatedLimiter(req, res, next);
  }
  return anonymousLimiter(req, res, next);
});


// Socket.io event handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // User activity tracking
  socket.on('user:active', (userId) => {
    // In a real implementation, we would store this information
    console.log(`User ${userId} is active`);
  });
  
  // Typing indicators
  socket.on('typing:start', (data) => {
    socket.broadcast.emit('user:typing', {
      userId: data.userId,
      roomId: data.roomId
    });
  });
  
  socket.on('typing:stop', (data) => {
    socket.broadcast.emit('user:stopped-typing', {
      userId: data.userId,
      roomId: data.roomId
    });
  });
  
  // Message handling
  socket.on('message:new', (messageData) => {
    // In a real implementation, we would save to DB first
    socket.broadcast.emit('message:received', messageData);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://thanperfect:CuW54NNNFKnGQtt6@doneisbetter.49s2z.mongodb.net/?retryWrites=true&w=majority&appName=doneisbetter';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Generic error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close()
      .then(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
      })
      .catch(err => {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
      });
  });
});

export { app, server, io };


