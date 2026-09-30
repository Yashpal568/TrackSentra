import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tracksentra_dev';
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
};
