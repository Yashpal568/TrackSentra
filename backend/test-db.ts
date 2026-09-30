import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI is not defined in .env file');
  process.exit(1);
}

console.log(`Attempting to connect to: ${uri.replace(/:([^:@]{1,})@/, ':****@')}`); // Hide password in logs

mongoose.connect(uri)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB Database!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB Database.');
    console.error('Error Details:', err.message);
    process.exit(1);
  });
