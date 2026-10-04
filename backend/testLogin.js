const axios = require('axios');

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@acmee2e.com',
      password: 'Password123!'
    });
    console.log('Login Status:', res.status);
    console.log('Cookies:', res.headers['set-cookie']);
    
    // Now test /me
    const cookieString = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
    const meRes = await axios.get('http://localhost:5000/api/auth/me', {
      headers: { Cookie: cookieString }
    });
    console.log('Me Status:', meRes.status);
    console.log('Me Data:', meRes.data);
  } catch (err) {
    console.error('Error:', err.response?.status, err.response?.data);
  }
}
testLogin();
