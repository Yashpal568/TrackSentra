import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User, UserRole } from '../models/User';
import { Company } from '../models/Company';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tracksentra';

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Super Admin shouldn't strictly need a companyId, but if the schema requires it,
    // we can create a placeholder "System" company or make companyId optional.
    // The User schema currently requires companyId for COMPANY_ADMIN/GUARD, but let's check
    // if it's required at the schema level.
    // Let's create a Platform tenant.
    let platformCompany = await Company.findOne({ name: 'TrackSentra Platform' });
    if (!platformCompany) {
      platformCompany = await Company.create({
        name: 'TrackSentra Platform',
        status: 'active',
      });
      console.log('Created TrackSentra Platform company');
    }

    const email = 'super@tracksentra.com';
    let superAdmin = await User.findOne({ email });

    if (superAdmin) {
      console.log('Super Admin already exists. Updating role to SUPER_ADMIN...');
      superAdmin.role = UserRole.SUPER_ADMIN;
      superAdmin.status = 'active';
      superAdmin.isEmailVerified = true;
      await superAdmin.save();
      console.log('Super Admin updated successfully.');
    } else {
      console.log('Creating new Super Admin...');
      const passwordHash = await bcrypt.hash('Password123!', 10);
      superAdmin = await User.create({
        companyId: platformCompany._id,
        firstName: 'Super',
        lastName: 'Admin',
        email,
        passwordHash,
        role: UserRole.SUPER_ADMIN,
        status: 'active',
        isEmailVerified: true,
      });
      console.log('Super Admin created successfully.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding Super Admin:', error);
    process.exit(1);
  }
};

seedSuperAdmin();
