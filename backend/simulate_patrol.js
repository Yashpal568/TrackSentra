const axios = require('axios');

const API = 'http://localhost:5000/api';
let adminToken = '';
let siteId = '';
let cpId = '';
let qrPayload = '';
let guardId = '';
let guardPassword = '';
let shiftId = '';
let guardToken = '';
let activePatrolId = '';

async function runSimulation() {
  try {
    console.log('1. Registering new admin account...');
    const registerRes = await axios.post(`${API}/auth/register`, {
      companyName: `Sim Corp ${Date.now()}`,
      firstName: 'Sim',
      lastName: 'Admin',
      email: `admin${Date.now()}@simcorp.com`,
      password: 'Password123!'
    });
    adminToken = registerRes.data.token;
    const authHeaders = { headers: { Authorization: `Bearer ${adminToken}` } };

    console.log('2. Creating Site...');
    const siteRes = await axios.post(`${API}/sites`, {
      name: `Test Site ${Date.now()}`,
      address: '123 Simulation Ave',
      timezone: 'Asia/Kolkata'
    }, authHeaders);
    siteId = siteRes.data.site._id;

    console.log('3. Creating Checkpoint...');
    const cpRes = await axios.post(`${API}/checkpoints`, {
      siteId,
      name: 'Simulated Gate',
      latitude: 40.7128,
      longitude: -74.0060,
      radius: 50
    }, authHeaders);
    cpId = cpRes.data.checkpoint._id;
    qrPayload = cpRes.data.checkpoint.qrPayload;

    console.log('4. Creating Guard...');
    const guardRes = await axios.post(`${API}/guards`, {
      firstName: 'Sim',
      lastName: 'Guard',
      email: `guard${Date.now()}@tracksentra.com`,
      phone: `999${Math.floor(1000000 + Math.random() * 9000000)}`
    }, authHeaders);
    guardId = guardRes.data.guard._id;
    guardPassword = guardRes.data.temporaryPassword;

    console.log('5. Creating Shift...');
    const now = new Date();
    const startTime = new Date(now.getTime() - 1000 * 60 * 60); // 1 hour ago
    const endTime = new Date(now.getTime() + 1000 * 60 * 60 * 7); // 7 hours from now
    const shiftRes = await axios.post(`${API}/shifts`, {
      guardId,
      siteId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      checkpoints: [cpId]
    }, authHeaders);
    shiftId = shiftRes.data.shift._id;

    console.log('6. Guard Login...');
    const guardLoginRes = await axios.post(`${API}/auth/login`, {
      email: guardRes.data.guard.email,
      password: guardPassword
    });
    guardToken = guardLoginRes.data.token;
    const guardHeaders = { headers: { Authorization: `Bearer ${guardToken}` } };

    console.log('7. Start Patrol Session...');
    const startRes = await axios.post(`${API}/patrols/start`, { shiftId }, guardHeaders);
    activePatrolId = startRes.data.patrol._id;

    console.log('8. Scan Checkpoint...');
    const scanRes = await axios.post(`${API}/patrols/${activePatrolId}/scan`, {
      checkpointId: cpId,
      qrPayload,
      latitude: 40.7128,
      longitude: -74.0060,
      accuracy: 10
    }, guardHeaders);

    console.log('9. Complete Patrol Session...');
    const completeRes = await axios.post(`${API}/patrols/${activePatrolId}/complete`, {}, guardHeaders);

    console.log('--- SIMULATION SUCCESSFUL ---');
    console.log('Patrol completed and logged to dashboard.');
  } catch (err) {
    console.error('SIMULATION ERROR:', err.response?.data || err.message);
  }
}

runSimulation();
