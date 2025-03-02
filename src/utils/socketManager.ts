import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

// Type definitions
interface User {
  id: string;
  socketId: string;
  username?: string;
  isTyping?: boolean;
  lastActivity?: Date;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  room?: string;
}

type BroadcastCallback = (socket: Socket) => void;

/**
 * SocketManager - A utility class to handle Socket.io functionality
 * 
 * This manager provides methods for:
 * - User tracking (connections, disconnections)
 * - Message broadcasting
 * - Typing indicators
 * - Activity monitoring
 */
class SocketManager {
  private io: Server | null = null;
  private activeUsers: Map<string, User> = new Map();
  private typingUsers: Map<string, Set<string>> = new Map(); // room -> Set of user IDs

  /**
   * Initialize the Socket.io server
   * @param httpServer The HTTP server instance
   */
  initialize(httpServer: HttpServer): void {
    if (this.io) {
      console.warn('Socket.io server already initialized');
      return;
    }

    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ['https://doneisbetter.com', 'https://staging.doneisbetter.com']
          : 'http://localhost:3000',
        credentials: true
      }
    });

    this.setupEventHandlers();
    console.log('Socket.io server initialized');
  }

  /**
   * Get the io server instance
   */
  getIO(): Server<DefaultEventsMap, DefaultEventsMap> {
    if (!this.io) {
      throw new Error('Socket.io server not initialized. Call initialize() first.');
    }
    return this.io;
  }

  /**
   * Get active users count
   */
  getActiveUsersCount(): number {
    return this.activeUsers.size;
  }

  /**
   * Get all active users
   */
  getActiveUsers(): User[] {
    return Array.from(this.activeUsers.values());
  }

  /**
   * Check if a user is connected
   * @param userId User ID to check
   */
  isUserConnected(userId: string): boolean {
    return this.activeUsers.has(userId);
  }

  /**
   * Setup global Socket.io event handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      console.log(`New client connected: ${socket.id}`);

      // Handle user registration
      socket.on('register_user', (userData: { userId: string, username?: string }) => {
        this.registerUser(socket, userData);
      });

      // Handle user disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // Handle messages
      socket.on('send_message', (message: Message) => {
        this.broadcastMessage(message);
      });

      // Handle typing indicators
      socket.on('typing_start', (data: { room: string, userId: string }) => {
        this.setUserTyping(data.userId, data.room, true);
      });

      socket.on('typing_end', (data: { room: string, userId: string }) => {
        this.setUserTyping(data.userId, data.room, false);
      });

      // Handle joining rooms
      socket.on('join_room', (room: string) => {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room: ${room}`);
      });

      // Handle leaving rooms
      socket.on('leave_room', (room: string) => {
        socket.leave(room);
        console.log(`Socket ${socket.id} left room: ${room}`);
      });

      // Record user activity
      socket.on('user_activity', (userId: string) => {
        this.updateUserActivity(userId);
      });
    });
  }

  /**
   * Register a new user when they connect
   * @param socket Socket instance
   * @param userData User data including ID and optional username
   */
  private registerUser(socket: Socket, userData: { userId: string, username?: string }): void {
    const { userId, username } = userData;
    
    // Record the user in our active users map
    this.activeUsers.set(userId, {
      id: userId,
      socketId: socket.id,
      username,
      lastActivity: new Date()
    });

    // Associate the socket ID with the user ID for easy lookup
    socket.data.userId = userId;

    // Notify everyone about the new user
    this.broadcastUserList();
    
    console.log(`User registered: ${userId} (${username || 'Anonymous'})`);
  }

  /**
   * Handle user disconnect
   * @param socket Socket instance
   */
  private handleDisconnect(socket: Socket): void {
    const userId = socket.data.userId;
    
    if (userId && this.activeUsers.has(userId)) {
      this.activeUsers.delete(userId);
      
      // Remove user from typing indicators in all rooms
      this.typingUsers.forEach((users, room) => {
        if (users.has(userId)) {
          users.delete(userId);
          this.broadcastTypingUsers(room);
        }
      });

      // Broadcast updated user list
      this.broadcastUserList();
      
      console.log(`User disconnected: ${userId}`);
    }
    
    console.log(`Client disconnected: ${socket.id}`);
  }

  /**
   * Update a user's last activity timestamp
   * @param userId User ID to update
   */
  private updateUserActivity(userId: string): void {
    const user = this.activeUsers.get(userId);
    if (user) {
      user.lastActivity = new Date();
      this.activeUsers.set(userId, user);
    }
  }

  /**
   * Broadcast a message to all clients or a specific room
   * @param message Message object to broadcast
   */
  broadcastMessage(message: Message): void {
    if (!this.io) return;

    if (message.room) {
      // Send to specific room
      this.io.to(message.room).emit('new_message', message);
      console.log(`Message broadcast to room ${message.room}: ${message.id}`);
    } else {
      // Send to all clients
      this.io.emit('new_message', message);
      console.log(`Message broadcast to all: ${message.id}`);
    }
  }

  /**
   * Set a user's typing status
   * @param userId User ID
   * @param room Room ID
   * @param isTyping Whether the user is typing
   */
  private setUserTyping(userId: string, room: string, isTyping: boolean): void {
    if (!this.typingUsers.has(room)) {
      this.typingUsers.set(room, new Set());
    }

    const roomTypingUsers = this.typingUsers.get(room)!;
    
    if (isTyping) {
      roomTypingUsers.add(userId);
    } else {
      roomTypingUsers.delete(userId);
    }

    // Update the user's typing status
    const user = this.activeUsers.get(userId);
    if (user) {
      user.isTyping = isTyping;
      this.activeUsers.set(userId, user);
    }

    this.broadcastTypingUsers(room);
  }

  /**
   * Broadcast the list of typing users in a room
   * @param room Room ID
   */
  private broadcastTypingUsers(room: string): void {
    if (!this.io) return;

    const typingUsers = this.typingUsers.get(room) || new Set();
    const typingUsersList = Array.from(typingUsers).map(userId => {
      const user = this.activeUsers.get(userId);
      return {
        id: userId,
        username: user?.username || 'Anonymous'
      };
    });

    this.io.to(room).emit('typing_users', {
      room,
      users: typingUsersList
    });
  }

  /**
   * Broadcast the list of active users to all clients
   */
  private broadcastUserList(): void {
    if (!this.io) return;

    const userList = Array.from(this.activeUsers.values()).map(user => ({
      id: user.id,
      username: user.username || 'Anonymous',
      isTyping: !!user.isTyping,
      lastActivity: user.lastActivity
    }));

    this.io.emit('user_list', userList);
  }

  /**
   * Broadcast an event to a specific room or all clients
   * @param event Event name
   * @param data Event data
   * @param room Optional room to target
   */
  broadcastEvent(event: string, data: any, room?: string): void {
    if (!this.io) return;

    if (room) {
      this.io.to(room).emit(event, data);
    } else {
      this.io.emit(event, data);
    }
  }

  /**
   * Broadcast an event to all clients except the sender
   * @param socket Socket instance of the sender
   * @param event Event name
   * @param data Event data
   */
  broadcastEventExceptSender(socket: Socket, event: string, data: any): void {
    socket.broadcast.emit(event, data);
  }

  /**
   * Execute a callback for each connected socket
   * @param callback Function to execute for each socket
   */
  forEachSocket(callback: BroadcastCallback): void {
    if (!this.io) return;

    const sockets = this.io.sockets.sockets;
    sockets.forEach(socket => {
      callback(socket);
    });
  }

  /**
   * Get diagnostic information for the dashboard
   */
  getDiagnosticInfo(): {
    connectionCount: number;
    activeRooms: string[];
    socketServer: string;
  } {
    if (!this.io) {
      return {
        connectionCount: 0,
        activeRooms: [],
        socketServer: 'Not initialized'
      };
    }

    const sockets = this.io.sockets.sockets;
    const rooms = new Set<string>();

    sockets.forEach(socket => {
      if (socket.rooms) {
        socket.rooms.forEach(room => {
          // Skip the default room (which is the socket ID)
          if (room !== socket.id) {
            rooms.add(room);
          }
        });
      }
    });

    return {
      connectionCount: sockets.size,
      activeRooms: Array.from(rooms),
      socketServer: 'Active'
    };
  }
}

// Export a singleton instance
export const socketManager = new SocketManager();

