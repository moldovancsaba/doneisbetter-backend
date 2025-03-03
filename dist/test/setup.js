"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAuthToken = exports.createTestUser = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const dotenv_1 = __importDefault(require("dotenv"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const express_1 = __importDefault(require("express"));
// Load environment variables from .env file
dotenv_1.default.config();
// Mock socket.io
let mongoServer;
let io;
// Setup before all tests
beforeAll(async () => {
    // Start in-memory MongoDB server
    mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    // Configure Mongoose to use the in-memory database
    await mongoose_1.default.connect(uri);
    // Setup mock Socket.io server
    const app = (0, express_1.default)();
    const httpServer = (0, http_1.createServer)(app);
    io = new socket_io_1.Server(httpServer);
    // Global mocks can be added here
    global.console.error = jest.fn();
    // Set test environment flag
    process.env.NODE_ENV = 'test';
});
// Clean up after each test
afterEach(async () => {
    // Clean up all collections after each test
    const collections = mongoose_1.default.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
    // Reset all mocks after each test
    jest.clearAllMocks();
});
// Cleanup after all tests
afterAll(async () => {
    // Close mongoose connection
    await mongoose_1.default.connection.close();
    // Stop in-memory MongoDB server
    if (mongoServer) {
        await mongoServer.stop();
    }
    // Close Socket.io server if needed
    if (io) {
        io.close();
    }
});
// Global test utilities and helpers
const createTestUser = async (role = 'user') => {
    // Implementation would depend on your User model
    return { role };
};
exports.createTestUser = createTestUser;
const generateAuthToken = (userId) => {
    // Mock JWT generation for testing
    return `test-token-${userId}`;
};
exports.generateAuthToken = generateAuthToken;
//# sourceMappingURL=setup.js.map