import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { User, UserRole } from '../src/models/User';
import { Company } from '../src/models/Company';
import { Guard } from '../src/models/Guard';
import { Subscription, SubscriptionStatus } from '../src/models/Subscription';
import bcrypt from 'bcryptjs';

describe('Guard Management API', () => {
  const setupData = async () => {
    const companyA = await Company.create({ name: 'Alpha' });
    const companyB = await Company.create({ name: 'Beta' });

    // Mock active subscriptions
    const subConfig = {
      planId: '000000000000000000000000',
      status: SubscriptionStatus.ACTIVE,
      planSnapshot: {
        name: 'Test Plan',
        price: 0,
        currency: 'USD',
        billingInterval: 'monthly',
        limits: { maxGuards: 100, maxSites: 100 }
      }
    };
    await Subscription.create({ companyId: companyA._id, ...subConfig });
    await Subscription.create({ companyId: companyB._id, ...subConfig });

    const passwordHash = await bcrypt.hash('Password123!', 1);
    
    const adminA = await User.create({
      companyId: companyA._id, firstName: 'A', lastName: 'Admin', email: 'admin@alpha.com', passwordHash, role: UserRole.COMPANY_ADMIN
    });

    const adminB = await User.create({
      companyId: companyB._id, firstName: 'B', lastName: 'Admin', email: 'admin@beta.com', passwordHash, role: UserRole.COMPANY_ADMIN
    });

    return { companyA, companyB, adminA, adminB };
  };

  const loginUser = async (email: string) => {
    const response = await request(app).post('/api/auth/login').send({ email, password: 'Password123!' });
    return response.headers['set-cookie'];
  };

  it('should allow COMPANY_ADMIN to onboard a new guard', async () => {
    await setupData();
    const cookies = await loginUser('admin@alpha.com');

    const res = await request(app)
      .post('/api/guards')
      .set('Cookie', cookies)
      .send({ 
        firstName: 'John', 
        lastName: 'Doe', 
        email: 'john.guard@alpha.com', 
        employeeId: 'G-001'
      });

    expect(res.status).toBe(201);
    expect(res.body.guard.employeeId).toBe('G-001');
    expect(res.body.user.email).toBe('john.guard@alpha.com');
    
    // Check tenant assignment
    const dbGuard = await Guard.findById(res.body.guard._id);
    expect(dbGuard?.companyId.toString()).not.toBeUndefined();
  });

  it('should sync inactive status to User model', async () => {
    const { companyA } = await setupData();
    const cookies = await loginUser('admin@alpha.com');

    // Create guard
    const createRes = await request(app).post('/api/guards').set('Cookie', cookies).send({ 
      firstName: 'Jane', lastName: 'Doe', email: 'jane@alpha.com'
    });
    
    const guardId = createRes.body.guard._id;
    const userId = createRes.body.user._id;

    // Deactivate guard
    const updateRes = await request(app)
      .put(`/api/guards/${guardId}`)
      .set('Cookie', cookies)
      .send({ status: 'inactive' });

    expect(updateRes.status).toBe(200);

    const userRecord = await User.findById(userId);
    expect(userRecord?.status).toBe('inactive');
  });

  it('should prevent cross-tenant guard access', async () => {
    const { companyB } = await setupData();
    const cookies = await loginUser('admin@alpha.com');

    // Create a guard manually in Company B
    const guardUserB = await User.create({ companyId: companyB._id, firstName: 'X', lastName: 'Y', email: 'x@b.com', passwordHash: 'hash', role: UserRole.GUARD });
    const guardB = await Guard.create({ companyId: companyB._id, userId: guardUserB._id });

    const res = await request(app)
      .get(`/api/guards/${guardB._id}`)
      .set('Cookie', cookies);

    expect(res.status).toBe(404);
  });
});
