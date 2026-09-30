import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, UserRole } from '../src/models/User';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const bootstrap = async () => {
  try {
    const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL;
    const adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD must be provided in .env');
      process.exit(1);
    }

    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI must be provided in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Super Admin already exists.');
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(adminPassword, 12);
    
    await User.create({
      firstName: 'System',
      lastName: 'SuperAdmin',
      email: adminEmail,
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      status: 'active'
    });

    console.log('Successfully provisioned Super Admin account.');
    process.exit(0);
  } catch (error) {
    console.error('Bootstrap failed:', error);
    process.exit(1);
  }
};

bootstrap();
