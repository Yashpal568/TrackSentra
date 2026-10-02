import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { User, UserRole } from '../src/models/User';
import { Company } from '../src/models/Company';
import { Site } from '../src/models/Site';
import { Checkpoint } from '../src/models/Checkpoint';
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
    
    const checkpoint = await Checkpoint.create({
      companyId: company._id,
      siteId: site._id,
      name: 'QR Checkpoint 1',
      qrPayload: 'test-opaque-token-1234',
      latitude: 40.7128,
      longitude: -74.0060,
      radius: 50
    });

    const route = await PatrolRoute.create({
      companyId: company._id,
      siteId: site._id,
      name: 'QR Patrol Route',
      checkpoints: [checkpoint._id],
      expectedDurationMinutes: 30
    });

    return { company, guard, site, checkpoint, route };
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
});
