const http = require('http');

const testUrls = [
  'http://localhost:5000/api/health',
  'http://localhost:3000'
];

function testEndpoint(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      console.log(`✓ ${url} - Status: ${res.statusCode}`);
      resolve(true);
    }).on('error', (err) => {
      console.log(`✗ ${url} - Error: ${err.message}`);
      resolve(false);
    });
  });
}

async function runTests() {
  console.log('Testing EcoTrack Application...\n');
  
  for (const url of testUrls) {
    await testEndpoint(url);
  }
  
  console.log('\nTest complete!');
}

runTests();
