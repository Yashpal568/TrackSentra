import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import app from '../src/app';
import { User, UserRole } from '../src/models/User';
import { Company } from '../src/models/Company';
import { Site } from '../src/models/Site';
import { Guard } from '../src/models/Guard';
import { PatrolRoute } from '../src/models/PatrolRoute';
import { PatrolSession } from '../src/models/PatrolSession';
import bcrypt from 'bcryptjs';

describe('Reports & Analytics API', () => {
  let adminToken: string;
  let guardToken: string;
  let companyId: string;
  let siteId: string;
  let guardId: string;

  beforeEach(async () => {
    // 1. Create company
    const company = await Company.create({
      name: 'Report Test Company',
      address: '123 Test St',
      contactEmail: 'admin@reporttest.com',
      contactPhone: '1234567890',
    });
    companyId = company._id.toString();

    const passwordHash = await bcrypt.hash('Password123!', 1);

    // 2. Create admin
    const admin = await User.create({
      email: 'admin@reporttest.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.COMPANY_ADMIN,
      companyId,
      status: 'active',
    });

    // 3. Create guard user & profile
    const guardUser = await User.create({
      email: 'guard@reporttest.com',
      passwordHash,
      firstName: 'John',
      lastName: 'Guard',
      role: UserRole.GUARD,
      companyId,
      status: 'active',
    });

    const guard = await Guard.create({
      userId: guardUser._id,
      companyId,
      firstName: 'John',
      lastName: 'Guard',
      employeeId: 'G123',
      status: 'active',
    });
    guardId = guard._id.toString();

    // 4. Create site
    const site = await Site.create({
      companyId,
      name: 'Report Site',
      address: 'Test Address',
      status: 'active',
    });
    siteId = site._id.toString();

    // 5. Create a route
    const route = await PatrolRoute.create({
      companyId,
      siteId,
      name: 'Report Route',
      checkpoints: [],
      expectedDurationMinutes: 30,
    });

    // 6. Create some patrol sessions
    await PatrolSession.create([
      { companyId, siteId, guardId, routeId: route._id, status: 'completed', startTime: new Date(), endTime: new Date() },
      { companyId, siteId, guardId, routeId: route._id, status: 'completed', startTime: new Date(), endTime: new Date() },
      { companyId, siteId, guardId, routeId: route._id, status: 'in_progress', startTime: new Date() },
    ]);

    // Login users
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@reporttest.com',
      password: 'Password123!',
    });
    expect(adminLogin.status).toBe(200);
    adminToken = adminLogin.body.accessToken;

    const guardLogin = await request(app).post('/api/auth/login').send({
      email: 'guard@reporttest.com',
      password: 'Password123!',
    });
    expect(guardLogin.status).toBe(200);
    guardToken = guardLogin.body.accessToken;
  });

  it('should return operational summary for admin', async () => {
    const res = await request(app)
      .get('/api/reports/operational')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.completed).toBe(2);
    expect(res.body.in_progress).toBe(1);
  });

  it('should deny operational summary to guard', async () => {
    const res = await request(app)
      .get('/api/reports/operational')
      .set('Authorization', `Bearer ${guardToken}`);
    
    if (res.status !== 403) console.log('guard operational error:', res.body);
    expect(res.status).toBe(403);
  });

  it('should return guard reports', async () => {
    const res = await request(app)
      .get('/api/reports/guards')
      .set('Authorization', `Bearer ${adminToken}`);
    
    if (res.status !== 200) console.log('admin guard reports error:', res.body);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].employeeId).toBe('G123');
    expect(res.body[0].totalPatrols).toBe(3);
    expect(res.body[0].completedPatrols).toBe(2);
  });

  it('should generate CSV export', async () => {
    const res = await request(app)
      .get('/api/reports/export/csv')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('Session ID,Site,Guard ID,Route,Status,Start Time,End Time');
    expect(res.text).toContain('Report Site');
    expect(res.text).toContain('G123');
  });
});
