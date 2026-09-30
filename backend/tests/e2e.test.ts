import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import bcrypt from 'bcryptjs';
import { User, UserRole } from '../src/models/User';
import { PaymentStatus } from '../src/models/PaymentSubmission';
import { Guard } from '../src/models/Guard';

describe('TrackSentra E2E Workflow', () => {
  let superAdminToken: string;
  let companyAdminToken: string;
  let guardToken: string;
  let planId: string;
  let paymentId: string;
  let siteId: string;
  let checkpoint1Id: string;
  let checkpoint2Id: string;
  let cp1Payload: string;
  let cp2Payload: string;
  let routeId: string;
  let guardId: string;
  let shiftId: string;
  let sessionId: string;

  it('Execute Full E2E Flow', async () => {
    // 1. Create Super Admin and Plan
    const passwordHash = await bcrypt.hash('password123', 10);
    await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'super@admin.com',
      passwordHash,
      role: UserRole.SUPER_ADMIN
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'super@admin.com',
      password: 'password123'
    });
    superAdminToken = loginRes.body.accessToken;

    const planRes = await request(app).post('/api/subscriptions/plans').set('Cookie', [`accessToken=${superAdminToken}`]).send({
      name: 'Enterprise Plan',
      description: 'Full featured',
      price: 29900,
      currency: 'USD',
      billingInterval: 'monthly',
      features: ['All'],
      limits: { maxGuards: 50, maxSites: 50 },
      visibility: 'public'
    });
    planId = planRes.body.plan._id;

    // 2. Customer Registration and Payment Approval
    const regRes = await request(app).post('/api/auth/register').send({
      companyName: 'Acme Security',
      firstName: 'John',
      lastName: 'Boss',
      email: 'john@acme.com',
      password: 'password123',
      planId
    });
    expect(regRes.status).toBe(201);
    companyAdminToken = regRes.body.accessToken;

    const payRes = await request(app).post('/api/subscriptions/pay').set('Cookie', [`accessToken=${companyAdminToken}`]).send({
      planId,
      transactionReference: 'TXN-001',
      paymentDate: new Date().toISOString()
    });
    paymentId = payRes.body.submission._id;

    const appRes = await request(app).post(`/api/subscriptions/payments/${paymentId}/verify`).set('Cookie', [`accessToken=${superAdminToken}`]).send({
      status: PaymentStatus.APPROVED
    });
    expect(appRes.status).toBe(200);

    // 3. Create Site and Checkpoints
    const siteRes = await request(app).post('/api/sites').set('Cookie', [`accessToken=${companyAdminToken}`]).send({
      name: 'Acme HQ',
      timezone: 'UTC'
    });
    expect(siteRes.status).toBe(201);
    siteId = siteRes.body.site._id;

    const cp1Res = await request(app).post('/api/checkpoints').set('Cookie', [`accessToken=${companyAdminToken}`]).send({
      siteId,
      name: 'Main Gate',
      location: 'Entrance',
      latitude: 40.7128,
      longitude: -74.0060,
      radius: 50
    });
    checkpoint1Id = cp1Res.body.checkpoint._id;
    cp1Payload = cp1Res.body.checkpoint.qrPayload;

    const cp2Res = await request(app).post('/api/checkpoints').set('Cookie', [`accessToken=${companyAdminToken}`]).send({
      siteId,
      name: 'Server Room',
      location: 'Basement',
      latitude: 40.7129,
      longitude: -74.0061,
      radius: 50
    });
    checkpoint2Id = cp2Res.body.checkpoint._id;
    cp2Payload = cp2Res.body.checkpoint.qrPayload;

    // 4. Create Patrol Route
    const routeRes = await request(app).post('/api/patrols/routes').set('Cookie', [`accessToken=${companyAdminToken}`]).send({
      siteId,
      name: 'HQ Night Patrol',
      checkpoints: [checkpoint1Id, checkpoint2Id],
      expectedDurationMinutes: 30
    });
    expect(routeRes.status).toBe(201);
    routeId = routeRes.body._id;

    // 5. Onboard Guard and Create Shift
    const guardRes = await request(app).post('/api/guards').set('Cookie', [`accessToken=${companyAdminToken}`]).send({
      firstName: 'Bob',
      lastName: 'Guard',
      email: 'bob@acme.com',
      employeeId: 'G-100'
    });
    
    guardId = guardRes.body.guard._id;
    
    // Simulate guard activation (setting password and active status directly)
    const guardUserObj = await User.findOne({ email: 'bob@acme.com' });
    const guardPasswordHash = await bcrypt.hash('password123', 10);
    await User.updateOne({ _id: guardUserObj?._id }, { passwordHash: guardPasswordHash, status: 'active', isEmailVerified: true });
    await Guard.updateOne({ userId: guardUserObj?._id }, { status: 'active' });

    const loginRes2 = await request(app).post('/api/auth/login').send({
      email: 'bob@acme.com',
      password: 'password123'
    });
    guardToken = loginRes2.body.accessToken;

    const now = new Date();
    const startTime = new Date(now.getTime() - 1000 * 60 * 60).toISOString();
    const endTime = new Date(now.getTime() + 1000 * 60 * 60 * 8).toISOString();

    const shiftRes = await request(app).post('/api/shifts').set('Cookie', [`accessToken=${companyAdminToken}`]).send({
      guardId,
      siteId,
      startTime,
      endTime
    });
    shiftId = shiftRes.body.shift._id;

    // 6. Execute Patrol Session
    const startRes = await request(app).post('/api/patrols/sessions').set('Cookie', [`accessToken=${guardToken}`]).send({
      siteId,
      routeId,
      shiftId
    });
    expect(startRes.status).toBe(201);
    sessionId = startRes.body._id;

    const scan1 = await request(app).post(`/api/patrols/sessions/${sessionId}/scans`).set('Cookie', [`accessToken=${guardToken}`]).send({
      qrPayload: cp1Payload,
      latitude: 40.7128,
      longitude: -74.0060,
      accuracy: 10
    });
    expect(scan1.status).toBe(201);
    expect(scan1.body.scan.status).toBe('valid');

    const scan2 = await request(app).post(`/api/patrols/sessions/${sessionId}/scans`).set('Cookie', [`accessToken=${guardToken}`]).send({
      qrPayload: cp2Payload,
      latitude: 40.7129,
      longitude: -74.0061,
      accuracy: 15
    });
    expect(scan2.status).toBe(201);
    expect(scan2.body.sessionStatus).toBe('completed');

    // 7. Generate Reports
    const reportRes = await request(app).get('/api/reports/operational').set('Cookie', [`accessToken=${companyAdminToken}`]);
    expect(reportRes.status).toBe(200);
    expect(reportRes.body.total).toBe(1);
    expect(reportRes.body.completed).toBe(1);
  });
});
