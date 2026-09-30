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
  const server = app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('SIGTERM or SIGINT signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      import('mongoose').then(mongoose => {
        mongoose.connection.close(false).then(() => {
          console.log('MongoDB connection closed');
          process.exit(0);
        });
      });
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
});
