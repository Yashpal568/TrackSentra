import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { User, UserRole } from '../src/models/User';
import { Company } from '../src/models/Company';
import { Site } from '../src/models/Site';
import { Checkpoint } from '../src/models/Checkpoint';
import bcrypt from 'bcryptjs';

describe('Checkpoint Management API', () => {
  const setupData = async () => {
    const companyA = await Company.create({ name: 'Alpha Checkpoints' });
    const companyB = await Company.create({ name: 'Beta Checkpoints' });

    const passwordHash = await bcrypt.hash('Password123!', 1);
    
    const adminA = await User.create({
      companyId: companyA._id, firstName: 'A', lastName: 'Admin', email: 'admin_c@alpha.com', passwordHash, role: UserRole.COMPANY_ADMIN
    });

    const adminB = await User.create({
      companyId: companyB._id, firstName: 'B', lastName: 'Admin', email: 'admin_c@beta.com', passwordHash, role: UserRole.COMPANY_ADMIN
    });

    const siteA = await Site.create({ companyId: companyA._id, name: 'Site Alpha C', status: 'active' });
    const siteB = await Site.create({ companyId: companyB._id, name: 'Site Beta C', status: 'active' });

    return { companyA, companyB, adminA, adminB, siteA, siteB };
  };

  const loginUser = async (email: string) => {
    const response = await request(app).post('/api/auth/login').send({ email, password: 'Password123!' });
    return response.headers['set-cookie'];
  };

  it('should allow COMPANY_ADMIN to create a checkpoint with auto-generated QR payload', async () => {
    const { siteA } = await setupData();
    const cookies = await loginUser('admin_c@alpha.com');

    const res = await request(app)
      .post('/api/checkpoints')
      .set('Cookie', cookies)
      .send({ 
        siteId: siteA._id,
        name: 'Gate 1',
        latitude: 40.7128,
        longitude: -74.0060,
        radius: 30
      });

    expect(res.status).toBe(201);
    expect(res.body.checkpoint.name).toBe('Gate 1');
    expect(res.body.checkpoint.qrPayload).toBeDefined();
    expect(typeof res.body.checkpoint.qrPayload).toBe('string');
  });

  it('should prevent cross-tenant site usage', async () => {
    const { siteB } = await setupData();
    const cookies = await loginUser('admin_c@alpha.com');

    const res = await request(app)
      .post('/api/checkpoints')
      .set('Cookie', cookies)
      .send({ 
        siteId: siteB._id, // User A trying to use Site B
        name: 'Gate 2'
      });

    expect(res.status).toBe(400); // Invalid or inactive site
  });

  it('should regenerate QR payload and invalidate old one', async () => {
    const { companyA, siteA } = await setupData();
    const cookies = await loginUser('admin_c@alpha.com');

    const checkpoint = await Checkpoint.create({
      companyId: companyA._id,
      siteId: siteA._id,
      name: 'Server Room',
      qrPayload: 'old-payload-123'
    });

    const res = await request(app)
      .post(`/api/checkpoints/${checkpoint._id}/qr`)
      .set('Cookie', cookies);

    expect(res.status).toBe(200);
    expect(res.body.checkpoint.qrPayload).not.toBe('old-payload-123');
    expect(res.body.checkpoint.qrPayload.length).toBeGreaterThan(10);
  });
});
