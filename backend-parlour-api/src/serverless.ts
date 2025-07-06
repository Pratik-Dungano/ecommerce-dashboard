import app from './app';
import connectDB from './config/db';

// Connect to database
connectDB().then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Failed to connect to MongoDB:', error);
});

// Export the Express app for Vercel serverless functions
export default app; 