import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app';
import { User, UserRole } from '../src/models/User';
import { Company } from '../src/models/Company';
import { Site } from '../src/models/Site';
import { Checkpoint } from '../src/models/Checkpoint';
import { Guard } from '../src/models/Guard';
import bcrypt from 'bcryptjs';

describe('Patrol Engine API', () => {
  const setupData = async () => {
    if (mongoose.connection.readyState === 0) {
      console.log('Mongoose is disconnected! Connecting manually...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri());
    }

    const company = await Company.create({ name: 'Patrol Test Corp' });
    const companyId = company._id.toString();

    const site = await Site.create({ companyId, name: 'Main Site', address: '123 Main St' });
    const siteId = site._id.toString();

    const passwordHash = await bcrypt.hash('password123', 1);
    
    const ts = Date.now();
    await User.create({
      companyId, firstName: 'Admin', lastName: 'User', email: `patrol.admin.${ts}@test.com`, passwordHash, role: UserRole.COMPANY_ADMIN
    });

    const guardUser = await User.create({
      companyId, firstName: 'Guard', lastName: 'User', email: `patrol.guard.${ts}@test.com`, passwordHash, role: UserRole.GUARD
    });
    const guardId = guardUser._id.toString();

    await Guard.create({ companyId, userId: guardId, employeeId: `EMP-P1-${ts}`, status: 'active' });

    const cp1 = await Checkpoint.create({ companyId, siteId, name: 'CP 1', location: 'Gate A', qrPayload: `qr-${ts}-1`, latitude: 40.7128, longitude: -74.0060, radius: 50 });
    const cp2 = await Checkpoint.create({ companyId, siteId, name: 'CP 2', location: 'Gate B', qrPayload: `qr-${ts}-2`, latitude: 40.7129, longitude: -74.0061, radius: 50 });

    return { companyId, siteId, cp1, cp2, adminEmail: `patrol.admin.${ts}@test.com`, guardEmail: `patrol.guard.${ts}@test.com` };
  };

  const loginUser = async (email: string) => {
    const res = await request(app).post('/api/auth/login').send({ email, password: 'password123' });
    return res.headers['set-cookie'];
  };

  it('should manage patrol configuration routes', async () => {
    const { siteId, cp1, cp2, adminEmail } = await setupData();
    const adminCookies = await loginUser(adminEmail);

    // Create valid route
    const createRes = await request(app)
      .post('/api/patrols/routes')
      .set('Cookie', adminCookies)
      .send({
        siteId,
        name: 'Perimeter Patrol',
        checkpoints: [cp1._id.toString(), cp2._id.toString()],
        expectedDurationMinutes: 30,
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.name).toBe('Perimeter Patrol');
    expect(createRes.body.checkpoints).toHaveLength(2);

    // Reject invalid checkpoints
    const fakeId = '507f1f77bcf86cd799439011';
    const invalidRes = await request(app)
      .post('/api/patrols/routes')
      .set('Cookie', adminCookies)
      .send({
        siteId,
        name: 'Invalid Patrol',
        checkpoints: [cp1._id.toString(), fakeId],
        expectedDurationMinutes: 30,
      });

    expect(invalidRes.status).toBe(400);
  }, 30000);

  it('should execute a complete patrol session flow successfully', async () => {
    const { siteId, cp1, cp2, adminEmail, guardEmail } = await setupData();
    const adminCookies = await loginUser(adminEmail);
    const guardCookies = await loginUser(guardEmail);

    // Admin creates route
    const routeRes = await request(app).post('/api/patrols/routes').set('Cookie', adminCookies).send({
      siteId, name: 'Main Route', checkpoints: [cp1._id.toString(), cp2._id.toString()], expectedDurationMinutes: 30,
    });
    const routeId = routeRes.body._id;

    // Guard starts session
    const startRes = await request(app).post('/api/patrols/sessions').set('Cookie', guardCookies).send({
      siteId, routeId
    });
    expect(startRes.status).toBe(201);
    expect(startRes.body.status).toBe('in_progress');
    const sessionId = startRes.body._id;

    // Prevent starting concurrent session
    const dupStartRes = await request(app).post('/api/patrols/sessions').set('Cookie', guardCookies).send({
      siteId, routeId
    });
    expect(dupStartRes.status).toBe(409);

    // Scan CP1 (valid)
    const scan1Res = await request(app).post(`/api/patrols/sessions/${sessionId}/scans`).set('Cookie', guardCookies).send({
      qrPayload: cp1.qrPayload,
      latitude: 40.71281, // Very close
      longitude: -74.00601,
      accuracy: 10,
    });
    expect(scan1Res.status).toBe(201);
    expect(scan1Res.body.scan.status).toBe('valid');
    expect(scan1Res.body.sessionStatus).toBe('in_progress');

    // Duplicate Scan CP1
    const scanDupRes = await request(app).post(`/api/patrols/sessions/${sessionId}/scans`).set('Cookie', guardCookies).send({
      qrPayload: cp1.qrPayload
    });
    expect(scanDupRes.status).toBe(409);

    // Invalid QR
    const scanInvRes = await request(app).post(`/api/patrols/sessions/${sessionId}/scans`).set('Cookie', guardCookies).send({
      qrPayload: 'bad_qr_code'
    });
    expect(scanInvRes.status).toBe(400);

    // Out of range GPS scan
    const scanOorRes = await request(app).post(`/api/patrols/sessions/${sessionId}/scans`).set('Cookie', guardCookies).send({
      qrPayload: cp2.qrPayload,
      latitude: 40.7500, // Too far away
      longitude: -74.0000,
      accuracy: 10,
    });
    expect(scanOorRes.status).toBe(400);
    expect(scanOorRes.body.error.message).toMatch(/Out of range/);

    // Scan CP2 (completes session)
    const scan2Res = await request(app).post(`/api/patrols/sessions/${sessionId}/scans`).set('Cookie', guardCookies).send({
      qrPayload: cp2.qrPayload,
      latitude: 40.71291,
      longitude: -74.00611,
      accuracy: 10,
    });
    expect(scan2Res.status).toBe(201);
    expect(scan2Res.body.scan.status).toBe('valid');
    expect(scan2Res.body.sessionStatus).toBe('completed');

    // Prevent scan on completed session
    const lateScanRes = await request(app).post(`/api/patrols/sessions/${sessionId}/scans`).set('Cookie', guardCookies).send({
      qrPayload: cp1.qrPayload
    });
    expect(lateScanRes.status).toBe(400);

    // Test suspended guard
    const guardUser = await User.findOne({ email: guardEmail });
    await Guard.updateOne({ userId: guardUser?._id }, { status: 'suspended' });
    
    // Admin creates new route
    const route2Res = await request(app).post('/api/patrols/routes').set('Cookie', adminCookies).send({
      siteId, name: 'Main Route 2', checkpoints: [cp1._id.toString(), cp2._id.toString()], expectedDurationMinutes: 30,
    });
    const routeId2 = route2Res.body._id;

    // Guard starts session
    const start2Res = await request(app).post('/api/patrols/sessions').set('Cookie', guardCookies).send({
      siteId, routeId: routeId2
    });
    expect(start2Res.status).toBe(403); // because guard is suspended, cannot start patrol
  }, 30000);
});
