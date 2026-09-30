import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { User, UserRole } from '../src/models/User';
import { Company } from '../src/models/Company';
import { Site } from '../src/models/Site';
import { Guard } from '../src/models/Guard';
import { Shift } from '../src/models/Shift';
import bcrypt from 'bcryptjs';

describe('Shift Scheduling API', () => {
  const setupData = async () => {
    const companyA = await Company.create({ name: 'Alpha' });
    const passwordHash = await bcrypt.hash('Password123!', 1);
    
    const adminA = await User.create({
      companyId: companyA._id, firstName: 'A', lastName: 'Admin', email: 'admin@alpha.com', passwordHash, role: UserRole.COMPANY_ADMIN
    });

    const siteA = await Site.create({ companyId: companyA._id, name: 'Site Alpha', status: 'active' });

    const guardUserA = await User.create({
      companyId: companyA._id, firstName: 'G', lastName: 'Guard', email: 'guard1@alpha.com', passwordHash, role: UserRole.GUARD
    });
    const guardA = await Guard.create({ companyId: companyA._id, userId: guardUserA._id, status: 'active' });

    return { companyA, adminA, siteA, guardA };
  };

  const loginUser = async (email: string) => {
    const response = await request(app).post('/api/auth/login').send({ email, password: 'Password123!' });
    return response.headers['set-cookie'];
  };

  it('should allow COMPANY_ADMIN to schedule a shift', async () => {
    const { siteA, guardA } = await setupData();
    const cookies = await loginUser('admin@alpha.com');

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 8 * 60 * 60 * 1000); // +8 hours

    const res = await request(app)
      .post('/api/shifts')
      .set('Cookie', cookies)
      .send({ 
        siteId: siteA._id,
        guardId: guardA._id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      });

    expect(res.status).toBe(201);
    expect(res.body.shift.guardId.toString()).toBe(guardA._id.toString());
  });

  it('should prevent overlapping shifts for the same guard', async () => {
    const { companyA, siteA, guardA } = await setupData();
    const cookies = await loginUser('admin@alpha.com');

    const t1 = new Date();
    const t2 = new Date(t1.getTime() + 4 * 60 * 60 * 1000);
    const t3 = new Date(t1.getTime() + 8 * 60 * 60 * 1000);

    // Create first shift t1 to t3
    await Shift.create({
      companyId: companyA._id, siteId: siteA._id, guardId: guardA._id, startTime: t1, endTime: t3
    });

    // Attempt overlapping shift t2 to t3
    const res = await request(app)
      .post('/api/shifts')
      .set('Cookie', cookies)
      .send({ 
        siteId: siteA._id,
        guardId: guardA._id,
        startTime: t2.toISOString(),
        endTime: t3.toISOString()
      });

    expect(res.status).toBe(409);
    expect(res.body.error.message).toContain('overlaps');
  });

  it('should deny shift creation for inactive guard', async () => {
    const { companyA, siteA } = await setupData();
    const cookies = await loginUser('admin@alpha.com');

    const inactiveGuardUser = await User.create({ companyId: companyA._id, firstName: 'I', lastName: 'G', email: 'ig@alpha.com', passwordHash: 'hash', role: UserRole.GUARD });
    const inactiveGuard = await Guard.create({ companyId: companyA._id, userId: inactiveGuardUser._id, employeeId: 'EMP-INACTIVE', status: 'inactive' });

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 8 * 60 * 60 * 1000);

    const res = await request(app)
      .post('/api/shifts')
      .set('Cookie', cookies)
      .send({ 
        siteId: siteA._id,
        guardId: inactiveGuard._id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('inactive guard');
  });
});
