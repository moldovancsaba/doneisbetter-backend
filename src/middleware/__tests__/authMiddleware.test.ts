import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { validateToken, requireAuth, requireAdmin, generateToken } from '../authMiddleware';

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  sign: jest.fn()
}));

describe('Auth Middleware Tests', () => {
  // Mock implementation for jwt functions
  const mockJwt = jwt as jest.Mocked<typeof jwt>;
  // Setup common test variables - must match the value in authMiddleware.ts
  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
  const jwtSecretBuffer = Buffer.from(jwtSecret, 'utf-8');
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Reset jwt mock implementations
    (jwt.verify as jest.Mock).mockReset();
    (jwt.sign as jest.Mock).mockReset();
    
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
      validateToken(mockRequest as Request, mockResponse as Response, nextFunction);
      
      // Assert
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.currentUser).toBeUndefined();
    });

    it('should call next() with no currentUser if auth header does not start with Bearer', () => {
      // Arrange
      mockRequest.headers = { authorization: 'Basic token123' };
      
      // Act
      validateToken(mockRequest as Request, mockResponse as Response, nextFunction);
      
      // Assert
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.currentUser).toBeUndefined();
    });

    it('should set currentUser and call next() if token is valid', () => {
      // Arrange
      const testUser = { id: '123', email: 'test@example.com', role: 'user' };
      mockRequest.headers = { authorization: 'Bearer validToken' };
      (jwt.verify as jest.Mock).mockReturnValue(testUser);
      
      // Act
      validateToken(mockRequest as Request, mockResponse as Response, nextFunction);
      
      // Assert
      expect(jwt.verify).toHaveBeenCalledWith('validToken', jwtSecretBuffer);
      expect(mockRequest.currentUser).toEqual(testUser);
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should handle invalid tokens properly', () => {
      // Arrange
      mockRequest.headers = { authorization: 'Bearer invalidToken' };
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      // Act
      validateToken(mockRequest as Request, mockResponse as Response, nextFunction);
      
      // Assert
      expect(jwt.verify).toHaveBeenCalledWith('invalidToken', jwtSecretBuffer);
      expect(mockRequest.currentUser).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('requireAuth', () => {
    it('should call next() if user is authenticated', () => {
      // Arrange
      mockRequest.currentUser = { id: '123', email: 'test@example.com', role: 'user' };
      
      // Act
      requireAuth(mockRequest as Request, mockResponse as Response, nextFunction);
      
      // Assert
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', () => {
      // Arrange
      mockRequest.currentUser = undefined;
      
      // Act
      requireAuth(mockRequest as Request, mockResponse as Response, nextFunction);
      
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
      requireAdmin(mockRequest as Request, mockResponse as Response, nextFunction);
      
      // Assert
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', () => {
      // Arrange
      mockRequest.currentUser = undefined;
      
      // Act
      requireAdmin(mockRequest as Request, mockResponse as Response, nextFunction);
      
      // Assert
      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Not authorized' });
    });

    it('should return 403 if user is not an admin', () => {
      // Arrange
      mockRequest.currentUser = { id: '123', email: 'user@example.com', role: 'user' };
      
      // Act
      requireAdmin(mockRequest as Request, mockResponse as Response, nextFunction);
      
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
      (jwt.sign as jest.Mock).mockReturnValue('generated-token');
      
      // Act
      const token = generateToken(user);
      
      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: '123', email: 'test@example.com', role: 'user' },
        jwtSecretBuffer,
        { expiresIn: expect.any(String) }
      );
      expect(token).toBe('generated-token');
    });
  });
});

