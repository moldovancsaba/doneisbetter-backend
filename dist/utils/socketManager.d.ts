import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
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
declare class SocketManager {
    private io;
    private activeUsers;
    private typingUsers;
    /**
     * Initialize the Socket.io server
     * @param httpServer The HTTP server instance
     */
    initialize(httpServer: HttpServer): void;
    /**
     * Get the io server instance
     */
    getIO(): Server<DefaultEventsMap, DefaultEventsMap>;
    /**
     * Get active users count
     */
    getActiveUsersCount(): number;
    /**
     * Get all active users
     */
    getActiveUsers(): User[];
    /**
     * Check if a user is connected
     * @param userId User ID to check
     */
    isUserConnected(userId: string): boolean;
    /**
     * Setup global Socket.io event handlers
     */
    private setupEventHandlers;
    /**
     * Register a new user when they connect
     * @param socket Socket instance
     * @param userData User data including ID and optional username
     */
    private registerUser;
    /**
     * Handle user disconnect
     * @param socket Socket instance
     */
    private handleDisconnect;
    /**
     * Update a user's last activity timestamp
     * @param userId User ID to update
     */
    private updateUserActivity;
    /**
     * Broadcast a message to all clients or a specific room
     * @param message Message object to broadcast
     */
    broadcastMessage(message: Message): void;
    /**
     * Set a user's typing status
     * @param userId User ID
     * @param room Room ID
     * @param isTyping Whether the user is typing
     */
    private setUserTyping;
    /**
     * Broadcast the list of typing users in a room
     * @param room Room ID
     */
    private broadcastTypingUsers;
    /**
     * Broadcast the list of active users to all clients
     */
    private broadcastUserList;
    /**
     * Broadcast an event to a specific room or all clients
     * @param event Event name
     * @param data Event data
     * @param room Optional room to target
     */
    broadcastEvent(event: string, data: any, room?: string): void;
    /**
     * Broadcast an event to all clients except the sender
     * @param socket Socket instance of the sender
     * @param event Event name
     * @param data Event data
     */
    broadcastEventExceptSender(socket: Socket, event: string, data: any): void;
    /**
     * Execute a callback for each connected socket
     * @param callback Function to execute for each socket
     */
    forEachSocket(callback: BroadcastCallback): void;
    /**
     * Get diagnostic information for the dashboard
     */
    getDiagnosticInfo(): {
        connectionCount: number;
        activeRooms: string[];
        socketServer: string;
    };
}
export declare const socketManager: SocketManager;
export {};
