import mongoose from 'mongoose';
import { Company } from './src/models/Company';
import { User, UserRole } from './src/models/User';
import { Subscription, SubscriptionStatus } from './src/models/Subscription';
import { Plan } from './src/models/Plan';
import { Guard } from './src/models/Guard';
import { Site } from './src/models/Site';
import { Checkpoint } from './src/models/Checkpoint';
import { Shift } from './src/models/Shift';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

async function seedE2E() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tracksentra');
  console.log('Seeding E2E test data...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Super Admin
  let superAdmin = await User.findOne({ email: 'super@tracksentra.com' });
  if (!superAdmin) {
    superAdmin = await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'super@tracksentra.com',
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      isEmailVerified: true
    });
  }

  // 2. Create Company
  let company = await Company.findOne({ name: 'Acme E2E Security' });
  if (!company) {
    company = await Company.create({
      name: 'Acme E2E Security',
      address: '123 E2E Lane',
      timezone: 'Asia/Kolkata',
      status: 'active'
    });
  }

  // 3. Create Company Admin
  let companyAdmin = await User.findOne({ email: 'admin@acmee2e.com' });
  if (!companyAdmin) {
    companyAdmin = await User.create({
      companyId: company._id,
      firstName: 'E2E',
      lastName: 'Admin',
      email: 'admin@acmee2e.com',
      passwordHash,
      role: UserRole.COMPANY_ADMIN,
      isEmailVerified: true
    });
  }

  // 4. Activate Subscription
  const plan = await Plan.findOne();
  if (plan) {
    let sub = await Subscription.findOne({ companyId: company._id });
    if (!sub) {
      await Subscription.create({
        companyId: company._id,
        planId: plan._id,
        status: SubscriptionStatus.ACTIVE,
        planSnapshot: {
          name: plan.name,
          price: plan.price,
          currency: plan.currency,
          billingInterval: plan.billingInterval,
          limits: plan.limits
        }
      });
    } else {
      sub.status = SubscriptionStatus.ACTIVE;
      await sub.save();
    }
  }

  // 5. Create Guard
  let guardUser = await User.findOne({ email: 'guard@acmee2e.com' });
  if (!guardUser) {
    guardUser = await User.create({
      companyId: company._id,
      firstName: 'Night',
      lastName: 'Watch',
      email: 'guard@acmee2e.com',
      passwordHash,
      role: UserRole.GUARD,
      isEmailVerified: true
    });

    await Guard.create({
      userId: guardUser._id,
      companyId: company._id,
      employeeId: 'GRD-E2E-01',
      status: 'active'
    });
  }

  // 6. Create 2 Sites
  let site1 = await Site.findOne({ name: 'E2E Main Gate' });
  if (!site1) {
    site1 = await Site.create({
      companyId: company._id,
      name: 'E2E Main Gate',
      address: 'Front Entrance',
      status: 'active',
      location: { type: 'Point', coordinates: [77.2090, 28.6139] } // Lng, Lat
    });
  }

  let site2 = await Site.findOne({ name: 'E2E Warehouse' });
  if (!site2) {
    site2 = await Site.create({
      companyId: company._id,
      name: 'E2E Warehouse',
      address: 'Back Facility',
      status: 'active',
      location: { type: 'Point', coordinates: [77.2091, 28.6140] }
    });
  }

  // 7. Create 4 Checkpoints (2 per site)
  await Checkpoint.deleteMany({ companyId: company._id });
  
  await Checkpoint.insertMany([
    {
      companyId: company._id,
      siteId: site1._id,
      name: 'Main Gate Check 1',
      qrCodeId: 'QR-MAIN-1',
      location: { type: 'Point', coordinates: [77.2090, 28.6139] },
      status: 'active'
    },
    {
      companyId: company._id,
      siteId: site1._id,
      name: 'Main Gate Check 2',
      qrCodeId: 'QR-MAIN-2',
      location: { type: 'Point', coordinates: [77.20905, 28.61395] },
      status: 'active'
    },
    {
      companyId: company._id,
      siteId: site2._id,
      name: 'Warehouse Check 1',
      qrCodeId: 'QR-WH-1',
      location: { type: 'Point', coordinates: [77.2091, 28.6140] },
      status: 'active'
    },
    {
      companyId: company._id,
      siteId: site2._id,
      name: 'Warehouse Check 2',
      qrCodeId: 'QR-WH-2',
      location: { type: 'Point', coordinates: [77.20915, 28.61405] },
      status: 'active'
    }
  ]);

  // 8. Assign duty to guard (Shift)
  await Shift.deleteMany({ companyId: company._id });
  await Shift.create({
    companyId: company._id,
    siteId: site1._id,
    guardId: guardUser._id,
    startTime: new Date(),
    endTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
    status: 'scheduled'
  });

  console.log('E2E Data Seeded Successfully!');
  console.log('Super Admin: super@tracksentra.com / Password123!');
  console.log('Company Admin: admin@acmee2e.com / Password123!');
  console.log('Guard: guard@acmee2e.com / Password123!');
  
  process.exit(0);
}

seedE2E().catch(console.error);
