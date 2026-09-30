import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import app from '../src/app';
import { User, UserRole } from '../src/models/User';
import { Company } from '../src/models/Company';
import { Site } from '../src/models/Site';
import bcrypt from 'bcryptjs';

describe('Incident Management API', () => {
  let adminToken: string;
  let guardToken: string;
  let companyId: string;
  let siteId: string;
  let incidentId: string;

  beforeEach(async () => {
    const company = await Company.create({
      name: 'Incident Test Company',
      address: '123 Test St',
      contactEmail: 'admin@incidenttest.com',
      contactPhone: '1234567890',
    });
    companyId = company._id.toString();

    const passwordHash = await bcrypt.hash('Password123!', 1);

    const admin = await User.create({
      email: 'admin@incidenttest.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.COMPANY_ADMIN,
      companyId,
      status: 'active',
    });

    const guardUser = await User.create({
      email: 'guard@incidenttest.com',
      passwordHash,
      firstName: 'John',
      lastName: 'Guard',
      role: UserRole.GUARD,
      companyId,
      status: 'active',
    });

    const site = await Site.create({
      companyId,
      name: 'Incident Site',
      address: 'Test Address',
      status: 'active',
    });
    siteId = site._id.toString();

    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@incidenttest.com',
      password: 'Password123!',
    });
    adminToken = adminLogin.body.accessToken;

    const guardLogin = await request(app).post('/api/auth/login').send({
      email: 'guard@incidenttest.com',
      password: 'Password123!',
    });
    guardToken = guardLogin.body.accessToken;
  });

  it('should allow guard to report an incident', async () => {
    const res = await request(app)
      .post('/api/incidents')
      .set('Authorization', `Bearer ${guardToken}`)
      .send({
        siteId,
        title: 'Broken Fence',
        description: 'Perimeter fence is damaged near gate 3.',
        category: 'Maintenance',
        severity: 'Medium'
      });
    
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Broken Fence');
    expect(res.body.status).toBe('Open');
    incidentId = res.body._id;
  });

  it('should allow admin to list incidents', async () => {
    // First create one
    await request(app)
      .post('/api/incidents')
      .set('Authorization', `Bearer ${guardToken}`)
      .send({
        siteId,
        title: 'Suspicious Vehicle',
        description: 'Unmarked van parked outside.',
        category: 'Security',
        severity: 'High'
      });

    const res = await request(app)
      .get('/api/incidents')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('Suspicious Vehicle');
  });

  it('should allow admin to update incident status and resolution', async () => {
    const createRes = await request(app)
      .post('/api/incidents')
      .set('Authorization', `Bearer ${guardToken}`)
      .send({
        siteId,
        title: 'Broken Light',
        description: 'Light out.',
        category: 'Maintenance',
        severity: 'Low'
      });
    
    const id = createRes.body._id;

    // Reject closing without resolution details
    const failRes = await request(app)
      .put(`/api/incidents/${id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'Closed'
      });
    
    expect(failRes.status).toBe(400);

    // Success with resolution
    const successRes = await request(app)
      .put(`/api/incidents/${id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'Closed',
        resolutionDetails: 'Light bulb replaced by maintenance team.'
      });
    
    expect(successRes.status).toBe(200);
    expect(successRes.body.status).toBe('Closed');
    expect(successRes.body.resolutionDetails).toBe('Light bulb replaced by maintenance team.');
  });

  it('should allow admin to add investigation notes', async () => {
    const createRes = await request(app)
      .post('/api/incidents')
      .set('Authorization', `Bearer ${guardToken}`)
      .send({
        siteId,
        title: 'Spill',
        description: 'Oil spill.',
        category: 'Maintenance',
        severity: 'Medium'
      });
    
    const id = createRes.body._id;

    const noteRes = await request(app)
      .post(`/api/incidents/${id}/notes`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        note: 'Maintenance dispatched.'
      });

    expect(noteRes.status).toBe(201);
    expect(noteRes.body.investigationNotes.length).toBe(1);
    expect(noteRes.body.investigationNotes[0].note).toBe('Maintenance dispatched.');
  });

  it('should deny guard access to update incident status', async () => {
    const createRes = await request(app)
      .post('/api/incidents')
      .set('Authorization', `Bearer ${guardToken}`)
      .send({
        siteId,
        title: 'Spill',
        description: 'Oil spill.',
        category: 'Maintenance',
        severity: 'Medium'
      });
    
    const id = createRes.body._id;

    const failRes = await request(app)
      .put(`/api/incidents/${id}`)
      .set('Authorization', `Bearer ${guardToken}`)
      .send({
        status: 'Closed',
        resolutionDetails: 'Closed by guard'
      });

    expect(failRes.status).toBe(403);
  });
});
