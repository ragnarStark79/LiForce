import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { config } from './src/config/env.js';

const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: config.socketCorsOrigin,
    credentials: true,
  },
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`✓ Socket connected: ${socket.id}`);

  // Join room
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room: ${roomId}`);
  });

  // Leave room
  socket.on('leaveRoom', (roomId) => {
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room: ${roomId}`);
  });

  // Handle chat messages
  socket.on('sendMessage', (data) => {
    const { roomId, message, senderId, receiverId } = data;
    
    // Broadcast message to room
    io.to(roomId).emit('messageReceived', {
      roomId,
      message,
      senderId,
      receiverId,
      timestamp: new Date(),
    });
  });

  // Handle notifications
  socket.on('notification', (data) => {
    const { userId, notification } = data;
    io.to(userId).emit('notification', notification);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`✗ Socket disconnected: ${socket.id}`);
  });
});

// Make io accessible to routes
app.set('io', io);

// Start server
const PORT = config.port;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start HTTP server
    httpServer.listen(PORT, () => {
      console.log(`\n🚀 LifeForce Server is running!`);
      console.log(`📍 Server: http://localhost:${PORT}`);
      console.log(`🏥 Environment: ${config.nodeEnv}`);
      console.log(`✓ Socket.io ready for connections\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
