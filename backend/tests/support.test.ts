import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import bcrypt from 'bcryptjs';
import { User, UserRole } from '../src/models/User';
import { Company } from '../src/models/Company';

describe('Support & Onboarding API', () => {
  it('Execute Full Support & Onboarding Flow', async () => {
    let superAdminToken: string;
    let companyAdminToken: string;
    let companyId: string;
    let ticketId: string;
    let articleId: string;

    const passwordHash = await bcrypt.hash('password123', 10);
    
    // Super Admin
    await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin_support@test.com',
      passwordHash,
      role: UserRole.SUPER_ADMIN
    });
    const saLogin = await request(app).post('/api/auth/login').send({ email: 'superadmin_support@test.com', password: 'password123' });
    expect(saLogin.status).toBe(200);
    superAdminToken = saLogin.body.accessToken;

    // Company & Admin
    const company = await Company.create({ name: 'Onboarding Test Co' });
    companyId = company._id.toString();

    await User.create({
      firstName: 'Company',
      lastName: 'Admin',
      email: 'admin_support@test.com',
      passwordHash,
      role: UserRole.COMPANY_ADMIN,
      companyId: company._id
    });
    const caLogin = await request(app).post('/api/auth/login').send({ email: 'admin_support@test.com', password: 'password123' });
    expect(caLogin.status).toBe(200);
    companyAdminToken = caLogin.body.accessToken;

    // 2. Onboarding Status
    const res = await request(app).get('/api/onboarding/status').set('Cookie', [`accessToken=${companyAdminToken}`]);
    expect(res.status).toBe(200);
    expect(res.body.steps.site_created).toBe(false);

    // 3. Help Center Admin
    const createRes = await request(app).post('/api/help-center/admin/articles').set('Cookie', [`accessToken=${superAdminToken}`]).send({
      title: 'How to use TrackSentra',
      slug: 'how-to-use',
      category: 'General',
      content: 'Just click buttons.',
      isPublished: true
    });
    expect(createRes.status).toBe(201);
    articleId = createRes.body._id;

    // 4. Help Center Public
    const listRes = await request(app).get('/api/help-center/articles').set('Cookie', [`accessToken=${companyAdminToken}`]);
    expect(listRes.status).toBe(200);
    expect(listRes.body.length).toBeGreaterThan(0);

    // 5. Create Ticket
    const createTicketRes = await request(app).post('/api/tickets').set('Cookie', [`accessToken=${companyAdminToken}`]).send({
      subject: 'My site is broken',
      category: 'Bug',
      description: 'Please fix it.'
    });
    expect(createTicketRes.status).toBe(201);
    ticketId = createTicketRes.body._id;

    // 6. Admin View Tickets
    const adminListRes = await request(app).get('/api/tickets/admin').set('Cookie', [`accessToken=${superAdminToken}`]);
    expect(adminListRes.status).toBe(200);
    expect(adminListRes.body.some((t: any) => t._id === ticketId)).toBe(true);

    // 7. Admin Reply Ticket
    const replyRes = await request(app).post(`/api/tickets/admin/${ticketId}/replies`).set('Cookie', [`accessToken=${superAdminToken}`]).send({
      content: 'We are looking into it.',
      status: 'IN_PROGRESS'
    });
    expect(replyRes.status).toBe(201);

    const ticketRes = await request(app).get(`/api/tickets/admin/${ticketId}`).set('Cookie', [`accessToken=${superAdminToken}`]);
    expect(ticketRes.body.ticket.status).toBe('IN_PROGRESS');
  });
});
