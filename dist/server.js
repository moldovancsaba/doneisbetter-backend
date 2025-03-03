"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
// Load environment variables
dotenv_1.default.config();
// Import models
require("./models/User");
require("./models/Message");
// Initialize Express app
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
// Socket.io setup
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production'
            ? ['https://doneisbetter.com', 'https://staging.doneisbetter.com']
            : 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
});
exports.io = io;
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://doneisbetter.com', 'https://staging.doneisbetter.com']
        : 'http://localhost:3000',
    credentials: true
}));
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
// Define rate limiters
const anonymousLimiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 50, // 50 requests per 10 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 10 minutes'
});
// Basic Hello World route
app.get('/', (req, res) => {
    res.send('Hello World');
});
// Apply rate limiting based on auth status
app.use((req, res, next) => {
    // Simple auth check - would be replaced with actual auth middleware
    if (req.headers.authorization) {
        return authenticatedLimiter(req, res, next);
    }
    return anonymousLimiter(req, res, next);
});
// Health check endpoint
app.get('/api/health', (req, res) => {
    const startTime = Date.now();
    // Create health check schema with Zod
    const HealthCheckSchema = zod_1.z.object({
        server: zod_1.z.string(),
        database: zod_1.z.string(),
        responseTime: zod_1.z.number(),
        timestamp: zod_1.z.string(),
        activeUsers: zod_1.z.number(),
        socketStatus: zod_1.z.string()
    });
    const healthData = {
        server: 'Running',
        database: mongoose_1.default.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        activeUsers: io.engine.clientsCount,
        socketStatus: io.engine.clientsCount > 0 ? 'Connected' : 'No Active Connections'
    };
    try {
        // Validate with Zod
        const validatedData = HealthCheckSchema.parse(healthData);
        res.json(validatedData);
    }
    catch (error) {
        res.status(500).json({ error: 'Health check validation failed' });
    }
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
mongoose_1.default.connect(MONGODB_URI)
    .then(() => {
    console.log('Connected to MongoDB');
})
    .catch((error) => {
    console.error('MongoDB connection error:', error);
});
// Generic error handler
app.use((err, req, res, next) => {
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
        mongoose_1.default.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});
//# sourceMappingURL=server.js.map