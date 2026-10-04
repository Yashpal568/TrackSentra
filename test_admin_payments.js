const axios = require('axios');
const mongoose = require('mongoose');

const API_URL = 'http://localhost:5000/api';

// Create an admin login helper or use existing demo account
async function test() {
  try {
    console.log('--- TESTING NEW ADMIN PAYMENTS API ---');
    
    // 1. Get an admin token (Assuming demoLogin works for COMPANY_ADMIN, wait, we need SUPER_ADMIN for this?)
    // In our backend, requireSuperAdmin might be needed. Let's see if we can get a super admin token.
    // We'll create a super admin directly in DB.
    await mongoose.connect('mongodb://127.0.0.1:27017/tracksentra');
    const { User, UserRole } = require('./backend/src/models/User');
    
    let admin = await User.findOne({ email: 'superadmin@test.com' });
    if (!admin) {
      admin = await User.create({
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@test.com',
        passwordHash: 'dummy',
        role: UserRole.SUPER_ADMIN,
        status: 'active'
      });
    }

    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ userId: admin._id, role: UserRole.SUPER_ADMIN }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });

    const axiosInstance = axios.create({
      headers: { Cookie: `accessToken=${token}` }
    });

    console.log('1. Fetching payments list...');
    const res = await axiosInstance.get(`${API_URL}/admin/payments`);
    console.log(`Received ${res.data.payments?.length} payments.`);
    console.log(`Pagination:`, res.data.pagination);
    console.log(`KPIs:`, res.data.kpis);

    if (res.data.payments && res.data.payments.length > 0) {
      const pId = res.data.payments[0]._id;
      console.log(`2. Fetching details for payment ${pId}...`);
      const detailsRes = await axiosInstance.get(`${API_URL}/admin/payments/${pId}/details`);
      console.log(`Details fetched successfully:`);
      console.log(`- Invoice exists:`, !!detailsRes.data.invoice);
      console.log(`- Subscription exists:`, !!detailsRes.data.subscription);
      console.log(`- Timeline length:`, detailsRes.data.timeline?.length);
    } else {
      console.log('No payments found to test details endpoint.');
    }

    console.log('--- ALL ADMIN PAYMENTS API TESTS PASSED ---');
    process.exit(0);
  } catch (error) {
    console.error('TEST FAILED:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

test();
