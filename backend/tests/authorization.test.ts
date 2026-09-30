import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express, { Request, Response } from 'express';
import { requireRole } from '../src/middleware/role.middleware';
import { authenticate } from '../src/middleware/auth.middleware';
import { UserRole } from '../src/models/User';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

// Mock authenticate middleware for tests where we just want to inject a user
app.use((req: any, res: any, next) => {
  if (req.headers['x-mock-role']) {
    req.user = {
      _id: 'user_id_123',
      role: req.headers['x-mock-role'],
      companyId: 'company_id_123',
      status: 'active'
    };
    return next();
  }
  next();
});

app.get('/api/admin-only', requireRole([UserRole.COMPANY_ADMIN]), (req: Request, res: Response) => {
  res.json({ success: true });
});

app.get('/api/guard-only', requireRole([UserRole.GUARD]), (req: Request, res: Response) => {
  res.json({ success: true });
});

describe('Authorization & RBAC', () => {
  it('should allow COMPANY_ADMIN to access admin-only route', async () => {
    const res = await request(app)
      .get('/api/admin-only')
      .set('x-mock-role', UserRole.COMPANY_ADMIN);
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should deny GUARD from accessing admin-only route', async () => {
    const res = await request(app)
      .get('/api/admin-only')
      .set('x-mock-role', UserRole.GUARD);
      
    expect(res.status).toBe(403);
  });

  it('should deny unauthenticated access if no mock role is provided', async () => {
    const res = await request(app)
      .get('/api/admin-only');
      
    expect(res.status).toBe(401);
  });

  it('should allow GUARD to access guard-only route', async () => {
    const res = await request(app)
      .get('/api/guard-only')
      .set('x-mock-role', UserRole.GUARD);
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
