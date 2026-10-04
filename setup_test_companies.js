const mongoose = require('mongoose');
const { Company } = require('./backend/src/models/Company');
const { User, UserRole } = require('./backend/src/models/User');
const { Subscription, SubscriptionStatus } = require('./backend/src/models/Subscription');
const { Plan } = require('./backend/src/models/Plan');

async function seed() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tracksentra');
  
  const starterPlan = await Plan.findOne({ name: 'Starter' });
  const enterprisePlan = await Plan.findOne({ name: 'Enterprise' });

  // Company A: Starter (Active)
  const compA = await Company.create({ name: 'Test Company A', email: 'compa@test.com', phone: '1111111111', status: 'active', contactPerson: 'Alice' });
  await User.create({ companyId: compA._id, email: 'admin@compa.com', passwordHash: 'hashed', firstName: 'Alice', lastName: 'A', role: UserRole.COMPANY_ADMIN });
  
  await Subscription.create({
    companyId: compA._id,
    planId: starterPlan._id,
    status: SubscriptionStatus.ACTIVE,
    planSnapshot: { name: starterPlan.name, price: starterPlan.pricing.monthly, currency: 'INR', billingInterval: 'monthly', limits: starterPlan.limits },
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 86400000)
  });

  // Company B: Enterprise (Active)
  const compB = await Company.create({ name: 'Test Company B', email: 'compb@test.com', phone: '2222222222', status: 'active', contactPerson: 'Bob' });
  await User.create({ companyId: compB._id, email: 'admin@compb.com', passwordHash: 'hashed', firstName: 'Bob', lastName: 'B', role: UserRole.COMPANY_ADMIN });
  
  await Subscription.create({
    companyId: compB._id,
    planId: enterprisePlan._id,
    status: SubscriptionStatus.ACTIVE,
    planSnapshot: { name: enterprisePlan.name, price: enterprisePlan.pricing.monthly, currency: 'INR', billingInterval: 'monthly', limits: enterprisePlan.limits },
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 86400000)
  });

  // Company C: No Subscription
  const compC = await Company.create({ name: 'Test Company C', email: 'compc@test.com', phone: '3333333333', status: 'active', contactPerson: 'Charlie' });
  await User.create({ companyId: compC._id, email: 'admin@compc.com', passwordHash: 'hashed', firstName: 'Charlie', lastName: 'C', role: UserRole.COMPANY_ADMIN });

  console.log('Seeded A, B, C');
  process.exit(0);
}

seed().catch(console.error);
