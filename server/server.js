import { createServer } from 'http';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { config } from './src/config/env.js';
import { initSocket } from './src/sockets/index.js';

const httpServer = createServer(app);

// Initialize Socket.io using the proper socket module (with chat handlers)
const io = initSocket(httpServer);

// Make io accessible to routes (for REST API socket emissions)
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
