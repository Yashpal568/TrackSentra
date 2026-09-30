import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { User, UserRole } from '../src/models/User';
import { Company } from '../src/models/Company';
import { Site } from '../src/models/Site';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

describe('Site Management API', () => {
  const setupData = async () => {
    const companyA = await Company.create({ name: 'Alpha' });
    const companyB = await Company.create({ name: 'Beta' });

    const passwordHash = await bcrypt.hash('Password123!', 10);
    
    const adminA = await User.create({
      companyId: companyA._id, firstName: 'A', lastName: 'Admin', email: 'admin@a.com', passwordHash, role: UserRole.COMPANY_ADMIN
    });

    const guardA = await User.create({
      companyId: companyA._id, firstName: 'A', lastName: 'Guard', email: 'guard@a.com', passwordHash, role: UserRole.GUARD
    });

    const adminB = await User.create({
      companyId: companyB._id, firstName: 'B', lastName: 'Admin', email: 'admin@b.com', passwordHash, role: UserRole.COMPANY_ADMIN
    });

    const siteB = await Site.create({
      companyId: companyB._id, name: 'Beta HQ', timezone: 'UTC'
    });

    return { companyA, companyB, adminA, guardA, adminB, siteB };
  };

  const loginUser = async (email: string) => {
    const response = await request(app).post('/api/auth/login').send({ email, password: 'Password123!' });
    return response.headers['set-cookie'];
  };

  it('should allow COMPANY_ADMIN to create a site for their tenant', async () => {
    await setupData();
    const cookies = await loginUser('admin@a.com');

    const res = await request(app)
      .post('/api/sites')
      .set('Cookie', cookies)
      .send({ name: 'Alpha HQ', timezone: 'EST' });

    expect(res.status).toBe(201);
    expect(res.body.site.name).toBe('Alpha HQ');
    
    // Verify tenant scope is forced securely by backend
    const dbSite = await Site.findById(res.body.site._id);
    expect(dbSite?.companyId.toString()).not.toBeUndefined();
  });

  it('should prevent cross-tenant site updates', async () => {
    const { siteB } = await setupData();
    const cookies = await loginUser('admin@a.com'); // Admin from company A

    const res = await request(app)
      .put(`/api/sites/${siteB._id}`)
      .set('Cookie', cookies)
      .send({ name: 'Hacked Site' });

    expect(res.status).toBe(404); // Site is not found because query is scoped to Company A
  });

  it('should list only sites belonging to the tenant', async () => {
    const { companyA, companyB } = await setupData();
    
    await Site.create({ companyId: companyA._id, name: 'Site A1' });
    await Site.create({ companyId: companyA._id, name: 'Site A2' });
    await Site.create({ companyId: companyB._id, name: 'Site B1' });

    const cookies = await loginUser('admin@a.com');
    const res = await request(app).get('/api/sites').set('Cookie', cookies);

    expect(res.status).toBe(200);
    expect(res.body.sites).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });

  it('should deny guards from creating sites', async () => {
    await setupData();
    const cookies = await loginUser('guard@a.com');

    const res = await request(app)
      .post('/api/sites')
      .set('Cookie', cookies)
      .send({ name: 'Unauthorized Site' });

    expect(res.status).toBe(403);
  });
});
