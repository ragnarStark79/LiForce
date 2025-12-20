import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';
import { handleChatSocket } from './chatSocket.js';
import { handleNotificationSocket } from './notificationSocket.js';

let io;

// Initialize Socket.io
export const initSocket = (server) => {
  // Use the dedicated socket CORS origin from config
  const socketOrigins = [
    process.env.CLIENT_URL || 'http://localhost:5173',
    process.env.SOCKET_CORS_ORIGIN || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:5174'
  ];

  // Remove duplicates
  const uniqueOrigins = [...new Set(socketOrigins)];

  console.log('Socket.io CORS allowed origins:', uniqueOrigins);

  io = new Server(server, {
    cors: {
      origin: uniqueOrigins,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware for socket connections
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.role = decoded.role;
      
      logger.info(`Socket authenticated: User ${decoded.userId} (${decoded.role})`);
      next();
    } catch (error) {
      logger.error('Socket authentication failed:', error.message);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id} (User: ${socket.userId})`);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Join role-specific rooms
    socket.join(`role:${socket.role}`);

    // Handle chat events
    handleChatSocket(io, socket);

    // Handle notification events
    handleNotificationSocket(io, socket);

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id} (User: ${socket.userId})`);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });

  logger.info('Socket.io initialized successfully');
  return io;
};

// Get io instance
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Emit event to specific user
export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

// Emit event to role
export const emitToRole = (role, event, data) => {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
  }
};

export default { initSocket, getIO, emitToUser, emitToRole };
