"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware_1 = require("../authMiddleware");
// Mock jwt
jest.mock('jsonwebtoken', () => ({
    verify: jest.fn(),
    sign: jest.fn()
}));
describe('Auth Middleware Tests', () => {
    // Mock implementation for jwt functions
    const mockJwt = jsonwebtoken_1.default;
    // Setup common test variables - must match the value in authMiddleware.ts
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const jwtSecretBuffer = Buffer.from(jwtSecret, 'utf-8');
    let mockRequest;
    let mockResponse;
    let nextFunction;
    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
        // Reset jwt mock implementations
        jsonwebtoken_1.default.verify.mockReset();
        jsonwebtoken_1.default.sign.mockReset();
        // Setup mock request and response
        mockRequest = {
            headers: {},
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        nextFunction = jest.fn();
    });
    describe('validateToken', () => {
        it('should call next() with no currentUser if no auth header is present', () => {
            // Act
            (0, authMiddleware_1.validateToken)(mockRequest, mockResponse, nextFunction);
            // Assert
            expect(nextFunction).toHaveBeenCalled();
            expect(mockRequest.currentUser).toBeUndefined();
        });
        it('should call next() with no currentUser if auth header does not start with Bearer', () => {
            // Arrange
            mockRequest.headers = { authorization: 'Basic token123' };
            // Act
            (0, authMiddleware_1.validateToken)(mockRequest, mockResponse, nextFunction);
            // Assert
            expect(nextFunction).toHaveBeenCalled();
            expect(mockRequest.currentUser).toBeUndefined();
        });
        it('should set currentUser and call next() if token is valid', () => {
            // Arrange
            const testUser = { id: '123', email: 'test@example.com', role: 'user' };
            mockRequest.headers = { authorization: 'Bearer validToken' };
            jsonwebtoken_1.default.verify.mockReturnValue(testUser);
            // Act
            (0, authMiddleware_1.validateToken)(mockRequest, mockResponse, nextFunction);
            // Assert
            expect(jsonwebtoken_1.default.verify).toHaveBeenCalledWith('validToken', jwtSecretBuffer);
            expect(mockRequest.currentUser).toEqual(testUser);
            expect(nextFunction).toHaveBeenCalled();
        });
        it('should handle invalid tokens properly', () => {
            // Arrange
            mockRequest.headers = { authorization: 'Bearer invalidToken' };
            jsonwebtoken_1.default.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });
            // Act
            (0, authMiddleware_1.validateToken)(mockRequest, mockResponse, nextFunction);
            // Assert
            expect(jsonwebtoken_1.default.verify).toHaveBeenCalledWith('invalidToken', jwtSecretBuffer);
            expect(mockRequest.currentUser).toBeUndefined();
            expect(nextFunction).toHaveBeenCalled();
        });
    });
    describe('requireAuth', () => {
        it('should call next() if user is authenticated', () => {
            // Arrange
            mockRequest.currentUser = { id: '123', email: 'test@example.com', role: 'user' };
            // Act
            (0, authMiddleware_1.requireAuth)(mockRequest, mockResponse, nextFunction);
            // Assert
            expect(nextFunction).toHaveBeenCalled();
            expect(mockResponse.status).not.toHaveBeenCalled();
        });
        it('should return 401 if user is not authenticated', () => {
            // Arrange
            mockRequest.currentUser = undefined;
            // Act
            (0, authMiddleware_1.requireAuth)(mockRequest, mockResponse, nextFunction);
            // Assert
            expect(nextFunction).not.toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Not authorized' });
        });
    });
    describe('requireAdmin', () => {
        it('should call next() if user is an admin', () => {
            // Arrange
            mockRequest.currentUser = { id: '123', email: 'admin@example.com', role: 'admin' };
            // Act
            (0, authMiddleware_1.requireAdmin)(mockRequest, mockResponse, nextFunction);
            // Assert
            expect(nextFunction).toHaveBeenCalled();
            expect(mockResponse.status).not.toHaveBeenCalled();
        });
        it('should return 401 if user is not authenticated', () => {
            // Arrange
            mockRequest.currentUser = undefined;
            // Act
            (0, authMiddleware_1.requireAdmin)(mockRequest, mockResponse, nextFunction);
            // Assert
            expect(nextFunction).not.toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Not authorized' });
        });
        it('should return 403 if user is not an admin', () => {
            // Arrange
            mockRequest.currentUser = { id: '123', email: 'user@example.com', role: 'user' };
            // Act
            (0, authMiddleware_1.requireAdmin)(mockRequest, mockResponse, nextFunction);
            // Assert
            expect(nextFunction).not.toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Forbidden: Admin access required' });
        });
    });
    describe('generateToken', () => {
        it('should generate a valid token with correct payload and options', () => {
            // Arrange
            const user = { id: '123', email: 'test@example.com', role: 'user' };
            jsonwebtoken_1.default.sign.mockReturnValue('generated-token');
            // Act
            const token = (0, authMiddleware_1.generateToken)(user);
            // Assert
            expect(jsonwebtoken_1.default.sign).toHaveBeenCalledWith({ id: '123', email: 'test@example.com', role: 'user' }, jwtSecretBuffer, { expiresIn: expect.any(String) });
            expect(token).toBe('generated-token');
        });
    });
});
