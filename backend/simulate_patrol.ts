import mongoose from 'mongoose';
import { Company } from './src/models/Company';
import { User, UserRole } from './src/models/User';
import { Site } from './src/models/Site';
import { Checkpoint } from './src/models/Checkpoint';
import { Guard } from './src/models/Guard';
import { Shift } from './src/models/Shift';
import { PatrolRoute } from './src/models/PatrolRoute';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const run = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/tracksentra');
    
    let company = await Company.findOne();
    if (!company) {
      company = await Company.create({ name: 'Script Company' });
    }

    const site = await Site.create({
      companyId: company._id,
      name: `Sim Site ${Date.now()}`,
      address: '123 Sim Ave',
      timezone: 'Asia/Kolkata',
      status: 'active'
    });

    const cp = await Checkpoint.create({
      companyId: company._id,
      siteId: site._id,
      name: 'Main Gate',
      latitude: 40.0,
      longitude: -74.0,
      radius: 50,
      qrPayload: `QR_${Date.now()}`
    });

    const route = await PatrolRoute.create({
      companyId: company._id,
      siteId: site._id,
      name: 'Main Route',
      checkpoints: [cp._id],
      expectedDurationMinutes: 60,
      status: 'active'
    });

    const guardUser = await User.create({
      companyId: company._id,
      firstName: 'Sim',
      lastName: 'Guard',
      email: `guard${Date.now()}@tracksentra.com`,
      passwordHash: await bcrypt.hash('guard123', 10),
      role: UserRole.GUARD,
      status: 'active',
      isEmailVerified: true
    });

    const guard = await Guard.create({
      userId: guardUser._id,
      companyId: company._id,
      siteId: site._id,
      employeeId: `EMP${Date.now()}`,
      firstName: 'Sim',
      lastName: 'Guard',
      email: guardUser.email,
      phone: `999000${Math.floor(1000 + Math.random() * 9000)}`,
      passwordHash: guardUser.passwordHash,
      status: 'active'
    });

    const now = new Date();
    const shift = await Shift.create({
      companyId: company._id,
      siteId: site._id,
      guardId: guard._id,
      name: 'Sim Shift',
      startTime: new Date(now.getTime() - 3600000),
      endTime: new Date(now.getTime() + 3600000 * 8),
      status: 'scheduled'
    });

    const guardToken = jwt.sign(
      { userId: guardUser._id, companyId: company._id, role: 'GUARD' },
      process.env.JWT_SECRET || 'super_secret_jwt_key_for_development',
      { expiresIn: '1d' }
    );

    const API = 'http://localhost:5000/api';
    const headers = { headers: { Authorization: `Bearer ${guardToken}` } };

    console.log('1. Starting Patrol Session...');
    const startRes = await axios.post(`${API}/patrols/sessions`, { siteId: site._id, routeId: route._id, shiftId: shift._id }, headers);
    const patrolId = startRes.data._id;

    console.log('2. Scanning Checkpoint...');
    await axios.post(`${API}/patrols/sessions/${patrolId}/scans`, {
      checkpointId: cp._id,
      qrPayload: cp.qrPayload,
      latitude: 40.0,
      longitude: -74.0,
      accuracy: 10
    }, headers);

    console.log('3. Completing Patrol Session...');
    await axios.post(`${API}/patrols/sessions/${patrolId}/complete`, {}, headers);

    console.log('SIMULATION SUCCESS!');
    process.exit(0);
  } catch (err: any) {
    if (err.response && err.response.data && err.response.data.error && err.response.data.error.details) {
      console.error('SIMULATION ERROR:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('SIMULATION ERROR:', err.response?.data || err.message);
    }
    process.exit(1);
  }
};

run();
