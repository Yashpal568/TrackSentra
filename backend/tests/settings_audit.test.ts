import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import app from '../src/app';
import { User, UserRole } from '../src/models/User';
import { Company } from '../src/models/Company';
import { AuditLog } from '../src/models/AuditLog';
import bcrypt from 'bcryptjs';

describe('Settings & Audit API', () => {
  let adminToken: string;
  let guardToken: string;
  let companyId: string;

  beforeEach(async () => {
    const company = await Company.create({
      name: 'Test Company',
      address: '123 Test St',
      timezone: 'UTC',
      settings: {
        patrol: { requireGps: true, gpsAccuracyThreshold: 50 },
        security: { sessionTimeoutMinutes: 60 }
      }
    });
    companyId = company._id.toString();

    const passwordHash = await bcrypt.hash('Password123!', 1);

    await User.create({
      email: 'admin@test.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.COMPANY_ADMIN,
      companyId,
      status: 'active',
    });

    await User.create({
      email: 'guard@test.com',
      passwordHash,
      firstName: 'Guard',
      lastName: 'User',
      role: UserRole.GUARD,
      companyId,
      status: 'active',
    });

    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@test.com',
      password: 'Password123!',
    });
    adminToken = adminLogin.body.accessToken;

    const guardLogin = await request(app).post('/api/auth/login').send({
      email: 'guard@test.com',
      password: 'Password123!',
    });
    guardToken = guardLogin.body.accessToken;
  });

  it('should allow admin to update company settings', async () => {
    const res = await request(app)
      .put(`/api/companies/${companyId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        timezone: 'America/New_York',
        settings: {
          patrol: {
            requireGps: false,
            gpsAccuracyThreshold: 100
          }
        }
      });
    
    expect(res.status).toBe(200);
    expect(res.body.company.timezone).toBe('America/New_York');
    expect(res.body.company.settings.patrol.requireGps).toBe(false);
    expect(res.body.company.settings.patrol.gpsAccuracyThreshold).toBe(100);
  });

  it('should deny guard from updating company settings', async () => {
    const res = await request(app)
      .put(`/api/companies/${companyId}`)
      .set('Authorization', `Bearer ${guardToken}`)
      .send({
        timezone: 'America/New_York'
      });
    
    expect(res.status).toBe(403);
  });

  it('should log UPDATE_COMPANY_SETTINGS to audit log and fetch it', async () => {
    await request(app)
      .put(`/api/companies/${companyId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        timezone: 'America/New_York',
      });
    
    const logs = await AuditLog.find({ companyId, action: 'UPDATE_COMPANY_SETTINGS' });
    expect(logs.length).toBe(1);
    expect(logs[0].details.newValues.timezone).toBe('America/New_York');

    const fetchRes = await request(app)
      .get('/api/audit')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(fetchRes.status).toBe(200);
    expect(fetchRes.body.data.length).toBeGreaterThan(0);
    expect(fetchRes.body.data[0].action).toBe('UPDATE_COMPANY_SETTINGS');
  });

  it('should export audit logs to CSV', async () => {
    await request(app)
      .put(`/api/companies/${companyId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ timezone: 'Europe/London' });

    const exportRes = await request(app)
      .get('/api/audit/export/csv')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(exportRes.status).toBe(200);
    expect(exportRes.headers['content-type']).toContain('text/csv');
    expect(exportRes.text).toContain('UPDATE_COMPANY_SETTINGS');
  });
});
