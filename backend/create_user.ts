import mongoose from 'mongoose';
import User, { UserRole } from './src/models/User';
import Company from './src/models/Company';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const run = async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/tracksentra');
  let company = await Company.findOne();
  if (!company) {
    company = await Company.create({ name: 'Script Company' });
  }

  let user = await User.findOne({ email: 'admin@script.com' });
  if (!user) {
    const passwordHash = await bcrypt.hash('password123', 10);
    user = await User.create({
      companyId: company._id,
      firstName: 'Admin',
      lastName: 'Script',
      email: 'admin@script.com',
      passwordHash,
      role: UserRole.COMPANY_ADMIN,
      status: 'active',
      isEmailVerified: true
    });
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role, companyId: user.companyId },
    process.env.JWT_SECRET || 'super_secret_jwt_key_for_development',
    { expiresIn: '1d' }
  );
  
  console.log(token);
  process.exit(0);
};

run().catch(console.error);
