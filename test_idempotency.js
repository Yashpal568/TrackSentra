require('dotenv').config({ path: './backend/.env' });
const axios = require('axios');
const mongoose = require('mongoose');
const { User, UserRole } = require('./backend/src/models/User');
const { Company } = require('./backend/src/models/Company');
const { PaymentSubmission } = require('./backend/src/models/PaymentSubmission');
const { Subscription, SubscriptionStatus } = require('./backend/src/models/Subscription');
const { Invoice } = require('./backend/src/models/Invoice');
const jwt = require('jsonwebtoken');

const API_URL = 'http://localhost:5000/api';

async function testIdempotency() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tracksentra');

  // Create test admin
  let admin = await User.findOne({ role: 'SUPER_ADMIN' });
  const token = jwt.sign({ userId: admin._id.toString(), role: 'SUPER_ADMIN' }, process.env.JWT_SECRET || 'fallback_secret');
  
  // Create test company
  let company = await Company.create({
    name: 'Idempotency Test Co',
    adminName: 'Test Admin',
    email: 'idem@test.com',
    industry: 'Other',
    country: 'IN',
    timezone: 'Asia/Kolkata',
    status: 'active'
  });

  // Create test subscription
  let sub = await Subscription.create({
    companyId: company._id,
    planId: new mongoose.Types.ObjectId(),
    status: SubscriptionStatus.PENDING_PAYMENT,
    planSnapshot: { name: 'Test', price: 5000, currency: 'INR', billingInterval: 'monthly', limits: { maxSites: 5, maxGuards: 10 } }
  });

  // Create pending payment submission
  let submis = await PaymentSubmission.create({
    companyId: company._id,
    subscriptionId: sub._id,
    submitterId: admin._id,
    expectedAmount: 5000,
    currency: 'INR',
    transactionReference: 'TXN-CONCURRENT-123',
    paymentDate: new Date(),
    status: 'PENDING'
  });

  console.log('Sending two concurrent verify requests...');
  
  const headers = { Cookie: `accessToken=${token}` };
  const p1 = axios.post(`${API_URL}/admin/verify-payment`, { companyId: company._id, status: 'APPROVED' }, { headers });
  const p2 = axios.post(`${API_URL}/admin/verify-payment`, { companyId: company._id, status: 'APPROVED' }, { headers });

  try {
    const results = await Promise.allSettled([p1, p2]);
    console.log('R1 Status:', results[0].status, results[0].value ? results[0].value.data : (results[0].reason?.response?.data || results[0].reason?.message));
    console.log('R2 Status:', results[1].status, results[1].value ? results[1].value.data : (results[1].reason?.response?.data || results[1].reason?.message));
  } catch (e) {}

  const invoices = await Invoice.find({ companyId: company._id });
  console.log('Number of invoices created:', invoices.length);

  // cleanup
  await Company.findByIdAndDelete(company._id);
  await Subscription.findByIdAndDelete(sub._id);
  await PaymentSubmission.findByIdAndDelete(submis._id);
  await Invoice.deleteMany({ companyId: company._id });
  
  process.exit(invoices.length === 1 ? 0 : 1);
}

testIdempotency();
