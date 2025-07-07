import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async (): Promise<void> => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Give more time for Atlas connection
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
    
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    console.error('Retrying connection in 5 seconds...');
    // Don't exit, let the app retry
    setTimeout(() => {
      connectDB();
    }, 5000);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB Disconnected');
  setTimeout(() => {
    console.log('Attempting to reconnect...');
    connectDB();
  }, 5000);
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB Error:', error);
  setTimeout(() => {
    console.log('Attempting to reconnect after error...');
    connectDB();
  }, 5000);
});

mongoose.connection.once('open', () => {
  console.log('MongoDB connection established successfully');
});

export default connectDB;
