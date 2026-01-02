const http = require('http');

// First, register a new test user
const registerData = JSON.stringify({
  email: 'testuser@example.com',
  password: 'password123',
  name: 'Test User'
});

const registerOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': registerData.length
  }
};

console.log('Step 1: Registering new user...');
const registerReq = http.request(registerOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Register Response:', res.statusCode, data);
    
    // Now try to login
    console.log('\nStep 2: Attempting to login...');
    const loginData = JSON.stringify({
      email: 'testuser@example.com',
      password: 'password123'
    });

    const loginOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    };

    const loginReq = http.request(loginOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('Login Response:', res.statusCode);
        try {
          const response = JSON.parse(data);
          if (response.token) {
            console.log('✓ SUCCESS! Token received:', response.token);
            console.log('User ID:', response.userId);
            console.log('User Name:', response.name);
          } else {
            console.log('Response:', response);
          }
        } catch (e) {
          console.log('Response:', data);
        }
        process.exit(0);
      });
    });

    loginReq.on('error', (e) => {
      console.error('Login Error:', e.message);
      process.exit(1);
    });

    loginReq.write(loginData);
    loginReq.end();
  });
});

registerReq.on('error', (e) => {
  console.error('Register Error:', e.message);
  process.exit(1);
});

registerReq.write(registerData);
registerReq.end();
