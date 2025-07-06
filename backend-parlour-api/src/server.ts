import { createServer } from 'http';
import app from './app';
import { setupAttendanceSocket } from './sockets/attendanceSocket';
import { initializeSchedulers } from './utils/scheduler';
import { Server } from 'socket.io';
import connectDB from './config/db';

const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = createServer(app);

const startServer = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Initialize schedulers
    initializeSchedulers();

    // Setup WebSocket
    const io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    // Make io accessible to routes
    (app as any).set('io', io);
    setupAttendanceSocket(io as any); // Type assertion to bypass strict type checking

    // Start server
    httpServer.listen(PORT, () => {
      console.log('🚀 Parlour API Server is running!');
      console.log(`📍 HTTP Server: http://localhost:${PORT}`);
      console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully');
      httpServer.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received, shutting down gracefully');
      httpServer.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 