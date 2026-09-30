import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { User, UserRole } from '../src/models/User';
import { Company } from '../src/models/Company';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

describe('Company Management API', () => {
  const createMockUsers = async () => {
    const companyA = await Company.create({ name: 'Alpha Corp' });
    const companyB = await Company.create({ name: 'Beta Inc' });

    const passwordHash = await bcrypt.hash('Password123!', 1);
    
    const superAdmin = await User.create({
      firstName: 'Super', lastName: 'Admin', email: 'super@admin.com', passwordHash, role: UserRole.SUPER_ADMIN
    });

    const adminA = await User.create({
      companyId: companyA._id, firstName: 'A', lastName: 'Admin', email: 'admin@alpha.com', passwordHash, role: UserRole.COMPANY_ADMIN
    });

    const guardA = await User.create({
      companyId: companyA._id, firstName: 'A', lastName: 'Guard', email: 'guard@alpha.com', passwordHash, role: UserRole.GUARD
    });

    return { companyA, companyB, superAdmin, adminA, guardA };
  };

  const loginUser = async (email: string) => {
    const response = await request(app).post('/api/auth/login').send({ email, password: 'Password123!' });
    return response.headers['set-cookie'];
  };

  it('should allow SUPER_ADMIN to create a new company', async () => {
    const { superAdmin } = await createMockUsers();
    const cookies = await loginUser('super@admin.com');

    const res = await request(app)
      .post('/api/companies')
      .set('Cookie', cookies)
      .send({ name: 'Gamma LLC', timezone: 'EST', address: '123 Main' });

    expect(res.status).toBe(201);
    expect(res.body.company.name).toBe('Gamma LLC');
  });

  it('should deny COMPANY_ADMIN from creating a new company', async () => {
    const { adminA } = await createMockUsers();
    const cookies = await loginUser('admin@alpha.com');

    const res = await request(app)
      .post('/api/companies')
      .set('Cookie', cookies)
      .send({ name: 'Rogue Company' });

    expect(res.status).toBe(403);
  });

  it('should allow COMPANY_ADMIN to update their own company', async () => {
    const { companyA } = await createMockUsers();
    const cookies = await loginUser('admin@alpha.com');

    const res = await request(app)
      .put(`/api/companies/${companyA._id}`)
      .set('Cookie', cookies)
      .send({ name: 'Alpha Corporation', address: 'Updated Address' });

    expect(res.status).toBe(200);
    expect(res.body.company.name).toBe('Alpha Corporation');
  });

  it('should prevent COMPANY_ADMIN from updating another company', async () => {
    const { companyB } = await createMockUsers();
    const cookies = await loginUser('admin@alpha.com');

    const res = await request(app)
      .put(`/api/companies/${companyB._id}`)
      .set('Cookie', cookies)
      .send({ name: 'Hacked Beta' });

    expect(res.status).toBe(403);
  });

  it('should enforce validation rules on company creation', async () => {
    const { superAdmin } = await createMockUsers();
    const cookies = await loginUser('super@admin.com');

    const res = await request(app)
      .post('/api/companies')
      .set('Cookie', cookies)
      .send({ name: 'A' }); // Too short

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Validation failed');
  });
});
