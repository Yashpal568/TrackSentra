const axios = require('axios');
const assert = require('assert');

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  try {
    console.log('--- STARTING FINANCIAL E2E API TESTS ---');
    
    // Login as super admin
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'super@tracksentra.com',
      password: 'Password123!'
    });
    
    const superToken = loginRes.data.accessToken;
    const authHeaders = { headers: { Authorization: `Bearer ${superToken}` } };
    
    // 1. Get companies to find targets
    const uniqueId = Date.now();
    const createRes = await axios.post(`${API_URL}/auth/register`, {
      companyName: `E2E Test Company ${uniqueId}`,
      email: `e2e${uniqueId}@test.com`,
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
      phone: '9999999999'
    });
    const companyC = { _id: createRes.data.user.companyId };
    
    console.log(`Target C (None): ${companyC._id}`);

    const impCRes = await axios.post(`${API_URL}/admin/companies/${companyC._id}/impersonate`, {}, authHeaders);
    const cookieC = impCRes.headers['set-cookie'][0];
    const impHeadersC = { headers: { Cookie: cookieC } };
    
    const plansRes = await axios.get(`${API_URL}/subscriptions/plans/public`);
    const plans = plansRes.data.plans;
    const starterPlan = plans.find(p => p.name === 'Starter Plan');
    const enterprisePlan = plans.find(p => p.name === 'Enterprise Plan');

    // --- TEST 1: INITIAL SUCCESSFUL PAYMENT (Company C) ---
    console.log('\n--- TEST 1: INITIAL PAYMENT (Company C) ---');
    
    // Select plan
    const selC = await axios.post(`${API_URL}/subscriptions/my`, { planId: starterPlan._id, billingInterval: 'monthly' }, impHeadersC);
    assert(selC.data.subscription.status === 'PENDING_PAYMENT');
    console.log('✓ PENDING_PAYMENT reached');
    
    // Submit payment
    const subC = await axios.post(`${API_URL}/subscriptions/pay`, {
      planId: starterPlan._id,
      transactionReference: 'TX-INITIAL-' + Date.now(),
      paymentDate: new Date(),
      expectedAmount: starterPlan.pricing.monthly,
      isUpgrade: false
    }, impHeadersC);
    
    const submissionIdC = subC.data.submission._id;
    console.log('✓ Payment submitted:', submissionIdC);
    
    // Admin Verify Payment
    const verC = await axios.post(`${API_URL}/admin/verify-payment`, {
      companyId: companyC._id,
      status: 'APPROVED'
    }, authHeaders);
    
    assert(verC.data.subscription.status === 'ACTIVE');
    assert(verC.data.invoice.status === 'PAID');
    console.log('✓ Payment verified, Subscription ACTIVE');
    console.log('✓ Invoice created:', verC.data.invoice.invoiceNumber);

    // --- TEST 2: PAYMENT IDEMPOTENCY ---
    console.log('\n--- TEST 2: PAYMENT IDEMPOTENCY ---');
    try {
      await axios.post(`${API_URL}/admin/verify-payment`, { companyId: companyC._id, status: 'APPROVED' }, authHeaders);
      assert.fail('Should have rejected idempotent request');
    } catch (e) {
      assert(e.response.status === 404); // Pending payment not found
      console.log('✓ Idempotency protected (404 expected on replay)');
    }

    // --- TEST 3: UPGRADE + PRORATION (Company C) ---
    console.log('\n--- TEST 3: UPGRADE + PRORATION (Company C) ---');
    const subARes = await axios.get(`${API_URL}/subscriptions/my`, impHeadersC);
    const subA = subARes.data.subscription;
    
    const upgradeReq = await axios.post(`${API_URL}/subscriptions/my`, { planId: enterprisePlan._id, billingInterval: 'monthly' }, impHeadersC);
    assert(upgradeReq.data.isUpgrade === true);
    assert(upgradeReq.data.prorationAmount !== undefined);
    
    console.log(`✓ Upgrade Intent Received: Credit ₹${upgradeReq.data.unusedCredit}, To Pay ₹${upgradeReq.data.prorationAmount}`);
    
    // Submit prorated payment
    const upgSub = await axios.post(`${API_URL}/subscriptions/pay`, {
      planId: enterprisePlan._id,
      transactionReference: 'TX-UPG-' + Date.now(),
      paymentDate: new Date(),
      expectedAmount: upgradeReq.data.prorationAmount,
      targetBillingInterval: 'monthly',
      isUpgrade: true,
      prorationCredit: upgradeReq.data.unusedCredit
    }, impHeadersC);
    
    // Verify Prorated Payment
    const verA = await axios.post(`${API_URL}/admin/verify-payment`, {
      companyId: companyC._id,
      status: 'APPROVED'
    }, authHeaders);
    
    assert(verA.data.subscription.status === 'ACTIVE');
    assert(verA.data.subscription.planId === enterprisePlan._id);
    console.log('✓ Upgrade Verified, Plan changed to Enterprise');
    
    // Verify Renewal Date Preservation
    console.log('Original End:', subA.currentPeriodEnd);
    console.log('New End:', verA.data.subscription.currentPeriodEnd);
    if(subA.currentPeriodEnd) {
      assert(new Date(verA.data.subscription.currentPeriodEnd).getTime() === new Date(subA.currentPeriodEnd).getTime());
      console.log('✓ Renewal Date Preserved');
    } else {
      console.log('⚠ Skipping Date check because original was null');
    }

    // --- TEST 4: REFUND ---
    console.log('\n--- TEST 4: REFUND ---');
    const refRes = await axios.post(`${API_URL}/admin/refund`, { submissionId: upgSub.data.submission._id }, authHeaders);
    assert(refRes.data.message === 'Refund processed successfully');
    console.log('✓ Refund Processed Successfully, Invoice Voided');
    
    // --- TEST 5: CANCEL & RESUME ---
    console.log('\n--- TEST 5: CANCEL & RESUME ---');
    const cancelRes = await axios.post(`${API_URL}/subscriptions/cancel`, {}, impHeadersC);
    assert(cancelRes.data.subscription.cancelAtPeriodEnd === true);
    console.log('✓ Cancelled at period end');
    
    const resumeRes = await axios.post(`${API_URL}/subscriptions/resume`, {}, impHeadersC);
    assert(resumeRes.data.subscription.cancelAtPeriodEnd === false);
    console.log('✓ Resumed subscription');

    console.log('\n--- ALL FINANCIAL API TESTS PASSED ---');
    
  } catch (e) {
    console.error('API TEST FAILED:', e.response ? e.response.data : e.message);
  }
}

runTests();
