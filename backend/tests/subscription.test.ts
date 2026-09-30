import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { User, UserRole } from '../src/models/User';
import { Company } from '../src/models/Company';
import { Plan } from '../src/models/Plan';
import { Subscription, SubscriptionStatus } from '../src/models/Subscription';
import { PaymentSubmission, PaymentStatus } from '../src/models/PaymentSubmission';
import bcrypt from 'bcryptjs';

describe('Subscription and Payment API', () => {
  let superAdminToken: string;
  let companyAdminToken: string;
  let companyId: string;
  let planId: string;
  let subscriptionId: string;
  let paymentSubmissionId: string;

  beforeEach(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tracksentra_test');
    }
    await User.deleteMany({});
    await Company.deleteMany({});
    await Plan.deleteMany({});
    await Subscription.deleteMany({});
    await PaymentSubmission.deleteMany({});

    // Create Super Admin
    const saPassword = await bcrypt.hash('password123', 10);
    const superAdmin = await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'sa@test.com',
      passwordHash: saPassword,
      role: UserRole.SUPER_ADMIN,
    });

    const saRes = await request(app).post('/api/auth/login').send({
      email: 'sa@test.com',
      password: 'password123'
    });
    superAdminToken = saRes.body.accessToken;

    // Create Plan
    const planRes = await request(app)
      .post('/api/subscriptions/plans')
      .set('Cookie', [`accessToken=${superAdminToken}`])
      .send({
        name: 'Pro Plan',
        description: 'Pro',
        price: 9900,
        currency: 'USD',
        billingInterval: 'monthly',
        features: ['All features'],
        limits: { maxGuards: 10, maxSites: 2 },
        visibility: 'public'
      });
    planId = planRes.body.plan._id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should execute end-to-end subscription flow', async () => {
    // 1. Register customer
    const regRes = await request(app).post('/api/auth/register').send({
      companyName: 'Test Corp',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@testcorp.com',
      password: 'password123',
      planId
    });

    expect(regRes.status).toBe(201);
    companyAdminToken = regRes.body.accessToken;

    const subRes = await request(app)
      .get('/api/subscriptions/my')
      .set('Cookie', [`accessToken=${companyAdminToken}`]);
    
    expect(subRes.status).toBe(200);
    expect(subRes.body.subscription.status).toBe(SubscriptionStatus.PENDING_PAYMENT);
    subscriptionId = subRes.body.subscription._id;

    // 2. Submit payment proof
    const payRes = await request(app)
      .post('/api/subscriptions/pay')
      .set('Cookie', [`accessToken=${companyAdminToken}`])
      .send({
        planId,
        transactionReference: 'TXN123456',
        paymentDate: new Date().toISOString()
      });

    expect(payRes.status).toBe(201);
    paymentSubmissionId = payRes.body.submission._id;

    // 3. Duplicate payment proof
    const dupRes = await request(app)
      .post('/api/subscriptions/pay')
      .set('Cookie', [`accessToken=${companyAdminToken}`])
      .send({
        planId,
        transactionReference: 'TXN123456', // Same ref
        paymentDate: new Date().toISOString()
      });
    expect(dupRes.status).toBe(400);

    // 4. Super Admin approve
    const appRes = await request(app)
      .post(`/api/subscriptions/payments/${paymentSubmissionId}/verify`)
      .set('Cookie', [`accessToken=${superAdminToken}`])
      .send({
        status: PaymentStatus.APPROVED
      });

    expect(appRes.status).toBe(200);
    expect(appRes.body.subscription.status).toBe(SubscriptionStatus.ACTIVE);

    // 5. Enforce resource limits (maxSites = 2)
    await request(app).post('/api/sites').set('Cookie', [`accessToken=${companyAdminToken}`]).send({ name: 'Site 1', address: 'A', timezone: 'UTC' });
    await request(app).post('/api/sites').set('Cookie', [`accessToken=${companyAdminToken}`]).send({ name: 'Site 2', address: 'B', timezone: 'UTC' });
    
    const limitRes = await request(app).post('/api/sites').set('Cookie', [`accessToken=${companyAdminToken}`]).send({ name: 'Site 3', address: 'C', timezone: 'UTC' });
    expect(limitRes.status).toBe(403);
  });

});
