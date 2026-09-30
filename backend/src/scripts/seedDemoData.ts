import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { Company } from '../models/Company';
import { User, UserRole } from '../models/User';
import { Site } from '../models/Site';
import { Guard } from '../models/Guard';
import { Checkpoint } from '../models/Checkpoint';

dotenv.config();

const seedDemoData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tracksentra');
    const companyId = process.argv[2];
    
    if (!companyId) {
      console.log('No company ID provided to seeder');
      process.exit(1);
    }
    
    // Create Sites
    const site1 = await Site.create({
      companyId,
      name: 'Alpha Manufacturing Plant',
      address: '100 Industrial Parkway, Metro City',
      status: 'active'
    });
    
    const site2 = await Site.create({
      companyId,
      name: 'Omega Logistics Hub',
      address: '400 Warehouse Blvd, Port City',
      status: 'active'
    });

    // Create Checkpoints for Site 1
    await Checkpoint.create([
      { companyId, siteId: site1._id, name: 'Main Gate', latitude: 37.7749, longitude: -122.4194, qrPayload: 'DEMO_QR_1', status: 'active' },
      { companyId, siteId: site1._id, name: 'Loading Dock A', latitude: 37.7750, longitude: -122.4190, qrPayload: 'DEMO_QR_2', status: 'active' },
      { companyId, siteId: site1._id, name: 'Server Room', latitude: 37.7745, longitude: -122.4185, qrPayload: 'DEMO_QR_3', status: 'active' }
    ]);
    
    // Create Guards
    const passwordHash = await bcrypt.hash('guard123!', 10);
    const guardUser1 = await User.create({ companyId, firstName: 'John', lastName: 'Doe', email: 'guard1@demo.com', passwordHash, role: UserRole.GUARD, status: 'active', isEmailVerified: true });
    const guardUser2 = await User.create({ companyId, firstName: 'Jane', lastName: 'Smith', email: 'guard2@demo.com', passwordHash, role: UserRole.GUARD, status: 'active', isEmailVerified: true });

    await Guard.create({ companyId, userId: guardUser1._id, employeeId: 'G-1001', assignedSites: [site1._id], status: 'active' });
    await Guard.create({ companyId, userId: guardUser2._id, employeeId: 'G-1002', assignedSites: [site1._id, site2._id], status: 'active' });

    console.log('Demo data seeded successfully for company', companyId);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed', err);
    process.exit(1);
  }
};

seedDemoData();
