import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { User, UserRole } from '../src/models/User';
import { Company } from '../src/models/Company';
import { Site } from '../src/models/Site';
import { Checkpoint } from '../src/models/Checkpoint';
import { Guard } from '../src/models/Guard';
import { PatrolRoute } from '../src/models/PatrolRoute';
import { Subscription, SubscriptionStatus } from '../src/models/Subscription';
import { Plan } from '../src/models/Plan';
import bcrypt from 'bcryptjs';

describe('Guard QR Workflow API', () => {
  const setupData = async () => {
    const company = await Company.create({ name: 'QR Workflow Company' });
    
    const plan = await Plan.create({
      name: 'Enterprise',
      description: 'Enterprise Plan',
      tier: 'ENTERPRISE',
      price: 100,
      currency: 'USD',
      billingInterval: 'monthly',
      limits: { maxGuards: 100, maxSites: 10 }
    });
    
    // Fix 402 errors by creating a subscription
    await Subscription.create({
      companyId: company._id,
      planId: plan._id,
      planSnapshot: {
        name: plan.name,
        price: plan.price,
        currency: plan.currency,
        billingInterval: plan.billingInterval,
        limits: plan.limits
      },
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    const passwordHash = await bcrypt.hash('Password123!', 1);
    
    const guard = await User.create({
      companyId: company._id, firstName: 'G', lastName: 'Guard', email: 'guard_qr@company.com', passwordHash, role: UserRole.GUARD
    });

    const site = await Site.create({ companyId: company._id, name: 'Site QR', status: 'active' });
    
    const guardProfile = await Guard.create({
      companyId: company._id, userId: guard._id, employeeId: 'G001', status: 'active', siteIds: [site._id]
    });
    
    const checkpoint = await Checkpoint.create({
      companyId: company._id,
      siteId: site._id,
      name: 'QR Checkpoint 1',
      qrPayload: 'test-opaque-token-1234',
      latitude: 40.7128,
      longitude: -74.0060,
      radius: 50,
      installationStatus: 'active'
    });

    const company2 = await Company.create({ name: 'QR Workflow Company 2' });
    await Subscription.create({
      companyId: company2._id,
      planId: plan._id,
      planSnapshot: {
        name: plan.name,
        price: plan.price,
        currency: plan.currency,
        billingInterval: plan.billingInterval,
        limits: plan.limits
      },
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    const admin = await User.create({
      companyId: company._id, firstName: 'A', lastName: 'Admin', email: 'admin_qr@company.com', passwordHash, role: UserRole.COMPANY_ADMIN
    });

    const guard2 = await User.create({
      companyId: company2._id, firstName: 'G2', lastName: 'Guard2', email: 'guard2_qr@company.com', passwordHash, role: UserRole.GUARD
    });
    const guardProfile2 = await Guard.create({
      companyId: company2._id, userId: guard2._id, employeeId: 'G002', status: 'active', siteIds: [site._id]
    });

    const checkpoint2 = await Checkpoint.create({
      companyId: company._id,
      siteId: site._id,
      name: 'QR Checkpoint 2',
      qrPayload: 'test-opaque-token-5678',
      latitude: 40.7128,
      longitude: -74.0060,
      radius: 50,
      installationStatus: 'active'
    });

    const checkpointOtherCompany = await Checkpoint.create({
      companyId: company2._id,
      siteId: site._id, // mock
      name: 'Other Company CP',
      qrPayload: 'other-company-token',
      latitude: 40.7128,
      longitude: -74.0060,
      radius: 50,
      installationStatus: 'active'
    });

    const route = await PatrolRoute.create({
      companyId: company._id,
      siteId: site._id,
      name: 'QR Patrol Route',
      checkpoints: [checkpoint._id, checkpoint2._id],
      expectedDurationMinutes: 30
    });

    return { company, guard, admin, guard2, site, checkpoint, checkpoint2, checkpointOtherCompany, route };
  };

  const loginUser = async (email: string) => {
    const response = await request(app).post('/api/auth/login').send({ email, password: 'Password123!' });
    return response.headers['set-cookie'];
  };

  it('should lookup checkpoint by valid token', async () => {
    const { checkpoint } = await setupData();
    const cookies = await loginUser('guard_qr@company.com');

    const res = await request(app)
      .get(`/api/checkpoints/lookup/${checkpoint.qrPayload}`)
      .set('Cookie', cookies);

    expect(res.status).toBe(200);
    expect(res.body.checkpoint._id.toString()).toBe(checkpoint._id.toString());
    expect(res.body.checkpoint.name).toBe('QR Checkpoint 1');
  });

  it('should reject invalid token lookup', async () => {
    await setupData();
    const cookies = await loginUser('guard_qr@company.com');

    const res = await request(app)
      .get('/api/checkpoints/lookup/invalid-token-xyz')
      .set('Cookie', cookies);

    expect(res.status).toBe(404);
  });

  it('should reject lookup from admin user', async () => {
    const { checkpoint } = await setupData();
    const cookies = await loginUser('admin_qr@company.com');

    const res = await request(app)
      .get(`/api/checkpoints/lookup/${checkpoint.qrPayload}`)
      .set('Cookie', cookies);

    expect(res.status).toBe(403);
  });

  it('should reject lookup for cross-company checkpoint', async () => {
    const { checkpointOtherCompany } = await setupData();
    const cookies = await loginUser('guard_qr@company.com');

    const res = await request(app)
      .get(`/api/checkpoints/lookup/${checkpointOtherCompany.qrPayload}`)
      .set('Cookie', cookies);

    expect(res.status).toBe(404); // Should be not found for this tenant
  });

  it('should successfully submit scan and complete patrol', async () => {
    const { route, site, checkpoint, checkpoint2 } = await setupData();
    const cookies = await loginUser('guard_qr@company.com');

    // Start session
    const startRes = await request(app)
      .post('/api/patrols/sessions')
      .set('Cookie', cookies)
      .send({ routeId: route._id, siteId: site._id });
    
    expect(startRes.status).toBe(201);
    const sessionId = startRes.body._id;

    // First scan - valid
    const scan1Res = await request(app)
      .post(`/api/patrols/sessions/${sessionId}/scans`)
      .set('Cookie', cookies)
      .send({
        qrPayload: checkpoint.qrPayload,
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10
      });

    expect(scan1Res.status).toBe(201);
    expect(scan1Res.body.scan.status).toBe('valid');
    expect(scan1Res.body.sessionStatus).toBe('in_progress');

    // Duplicate scan - should reject
    const dupRes = await request(app)
      .post(`/api/patrols/sessions/${sessionId}/scans`)
      .set('Cookie', cookies)
      .send({
        qrPayload: checkpoint.qrPayload,
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10
      });

    expect(dupRes.status).toBe(409);
    expect(dupRes.body.error.message).toMatch(/already scanned/i);

    // Scan out of radius - should reject or mark invalid depending on logic, here assume it rejects if strict
    // Let's test a very far GPS location (Paris)
    const farRes = await request(app)
      .post(`/api/patrols/sessions/${sessionId}/scans`)
      .set('Cookie', cookies)
      .send({
        qrPayload: checkpoint2.qrPayload,
        latitude: 48.8566,
        longitude: 2.3522,
        accuracy: 10
      });

    expect(farRes.status).toBe(400);
    expect(farRes.body.error.message).toMatch(/distance/i);

    // Second scan - valid (complete patrol)
    const scan2Res = await request(app)
      .post(`/api/patrols/sessions/${sessionId}/scans`)
      .set('Cookie', cookies)
      .send({
        qrPayload: checkpoint2.qrPayload,
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10
      });

    expect(scan2Res.status).toBe(201);
    expect(scan2Res.body.scan.status).toBe('valid');
    expect(scan2Res.body.sessionStatus).toBe('completed');
  });
});

