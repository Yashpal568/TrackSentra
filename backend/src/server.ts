import dotenv from 'dotenv';
import app from './app';

import { connectDB } from './db';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to database before starting the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
