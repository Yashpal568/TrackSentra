import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { User, UserRole } from '../src/models/User';
import { Company } from '../src/models/Company';
import bcrypt from 'bcryptjs';

describe('Auth API', () => {
  const createMockUser = async () => {
    const company = await Company.create({ name: 'Acme Corp' });
    const passwordHash = await bcrypt.hash('Password123!', 1);
    const user = await User.create({
      companyId: company._id,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@acme.com',
      passwordHash,
      role: UserRole.COMPANY_ADMIN,
    });
    return { company, user };
  };

  it('should login successfully with valid credentials', async () => {
    await createMockUser();
    
    const response = await request(app).post('/api/auth/login').send({
      email: 'john@acme.com',
      password: 'Password123!'
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.user).toHaveProperty('email', 'john@acme.com');
    expect(response.body.user).not.toHaveProperty('passwordHash');
    
    // Check httpOnly cookies
    const cookies = response.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some((c: string) => c.startsWith('refreshToken='))).toBe(true);
    expect(cookies.some((c: string) => c.startsWith('accessToken='))).toBe(true);
  });

  it('should fail login with invalid password', async () => {
    await createMockUser();

    const response = await request(app).post('/api/auth/login').send({
      email: 'john@acme.com',
      password: 'WrongPassword'
    });

    expect(response.status).toBe(401);
  });

  it('should fail login with non-existent user', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'nobody@acme.com',
      password: 'Password123!'
    });

    expect(response.status).toBe(401);
  });

  it('should refresh token successfully', async () => {
    await createMockUser();
    
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'john@acme.com',
      password: 'Password123!'
    });

    const cookies = loginRes.headers['set-cookie'];

    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookies);

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body).toHaveProperty('accessToken');
  });

  it('should logout successfully', async () => {
    await createMockUser();
    
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'john@acme.com',
      password: 'Password123!'
    });

    const cookies = loginRes.headers['set-cookie'];

    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookies);

    expect(logoutRes.status).toBe(200);
    const logoutCookies = logoutRes.headers['set-cookie'];
    // accessToken and refreshToken should be cleared
    expect(logoutCookies.some((c: string) => c.includes('accessToken=;'))).toBe(true);
  });

  it('should get current user profile when authenticated', async () => {
    await createMockUser();
    
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'john@acme.com',
      password: 'Password123!'
    });

    const token = loginRes.body.accessToken;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user).toHaveProperty('email', 'john@acme.com');
  });

  it('should reject unauthenticated access to /api/auth/me', async () => {
    const meRes = await request(app).get('/api/auth/me');
    expect(meRes.status).toBe(401);
  });
});
