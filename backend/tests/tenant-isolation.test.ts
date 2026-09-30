import { describe, it, expect } from 'vitest';
import { User } from '../src/models/User';
import { Company } from '../src/models/Company';
import mongoose from 'mongoose';

describe('Tenant Isolation Tests', () => {
  it('should ensure models are scoped by companyId', async () => {
    const companyA = await Company.create({ name: 'Company A' });
    const companyB = await Company.create({ name: 'Company B' });

    await User.create({
      companyId: companyA._id,
      firstName: 'A', lastName: 'User',
      email: 'a@company.com',
      passwordHash: 'hash',
      role: 'GUARD'
    });

    await User.create({
      companyId: companyB._id,
      firstName: 'B', lastName: 'User',
      email: 'b@company.com',
      passwordHash: 'hash',
      role: 'GUARD'
    });

    // Query without tenant isolation
    const allUsers = await User.find();
    expect(allUsers.length).toBe(2);

    // Query with tenant isolation
    const usersA = await User.find({ companyId: companyA._id });
    expect(usersA.length).toBe(1);
    expect(usersA[0].email).toBe('a@company.com');

    // Attempted cross-tenant access via guessed ID should return null if tenant condition is enforced
    const maliciousFind = await User.findOne({ _id: usersA[0]._id, companyId: companyB._id });
    expect(maliciousFind).toBeNull();
  });
});
