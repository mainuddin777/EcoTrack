const db = require('./db');

// Get the first user
const user = db.prepare('SELECT id, email, name FROM users LIMIT 1').get();

if (user) {
  console.log('Test User Found:');
  console.log('ID:', user.id);
  console.log('Email:', user.email);
  console.log('Name:', user.name);
} else {
  console.log('No users found in database');
}

// Let's also test the API endpoint manually
const http = require('http');

const loginData = JSON.stringify({
  email: user?.email || 'test@example.com',
  password: 'test123' // This is a guess for the test user
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('\nLogin API Response:');
    console.log('Status:', res.statusCode);
    console.log('Body:', data);
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
  process.exit(1);
});

req.write(loginData);
req.end();
