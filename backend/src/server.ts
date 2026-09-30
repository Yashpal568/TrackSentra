import dotenv from 'dotenv';
import app from './app';
import { connectDB } from './db';

dotenv.config();

const requiredEnvs = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
for (const env of requiredEnvs) {
  if (!process.env[env]) {
    console.error(`❌ Startup Error: Missing required environment variable ${env}`);
    process.exit(1);
  }
}

const PORT = process.env.PORT || 5000;

// Connect to database before starting the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
  });
});
