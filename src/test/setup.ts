import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';

// Load environment variables from .env file
dotenv.config();

// Mock socket.io
let mongoServer: MongoMemoryServer;
let io: Server;

// Setup before all tests
beforeAll(async () => {
  // Start in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  // Configure Mongoose to use the in-memory database
  await mongoose.connect(uri);
  
  // Setup mock Socket.io server
  const app = express();
  const httpServer = createServer(app);
  io = new Server(httpServer);
  
  // Global mocks can be added here
  global.console.error = jest.fn();
  
  // Set test environment flag
  process.env.NODE_ENV = 'test';
});

// Clean up after each test
afterEach(async () => {
  // Clean up all collections after each test
  const collections = mongoose.connection.collections;
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
  await mongoose.connection.close();
  
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
export const createTestUser = async (role = 'user') => {
  // Implementation would depend on your User model
  return { role };
};

export const generateAuthToken = (userId: string) => {
  // Mock JWT generation for testing
  return `test-token-${userId}`;
};

