import mongoose from 'mongoose';
import config from '../config/config.js';

export async function connectDB(): Promise<boolean> {
  const mongoUri = config.MONGO_URL || process.env.MONGO_URL;

  if (!mongoUri) {
    console.warn('⚠️ MONGO_URL not specified in environment! MongoDB features inactive.');
    return false;
  }

  if (mongoose.connection.readyState >= 1) {
    return true;
  }

  try {
    const maskedUri = mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log(`Connecting to MongoDB URI: ${maskedUri}`);
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });
    
    console.log('✅ Connected to MongoDB Database successfully!');
    return true;
  } catch (error: any) {
    console.error('❌ Error connecting to MongoDB:', error.message || error);
    return false;
  }
}
