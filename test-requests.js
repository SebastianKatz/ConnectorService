import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Test cases
const tests = [
  {
    name: 'Health Check',
    method: 'GET',
    endpoint: '/health',
  },
  {
    name: 'Whitelisted User Message',
    method: 'POST',
    endpoint: '/api/process-message',
    body: {
      telegram_id: '123456789',
      message: 'hello'
    }
  },
  {
    name: 'Non-whitelisted User Message',
    method: 'POST',
    endpoint: '/api/process-message',
    body: {
      telegram_id: '987654321',
      message: 'hello'
    }
  },
  {
    name: 'Unknown User Message',
    method: 'POST',
    endpoint: '/api/process-message',
    body: {
      telegram_id: '111111111',
      message: 'hello'
    }
  }
];

// Function to run tests
async function runTests() {
  console.log('=== Starting Test Requests ===\n');

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      
      const options = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (test.body) {
        options.body = JSON.stringify(test.body);
      }

      const response = await fetch(`${BASE_URL}${test.endpoint}`, options);
      const data = await response.json();

      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(data, null, 2));
      console.log('-------------------\n');
    } catch (error) {
      console.error(`Error in ${test.name}:`, error.message);
      console.log('-------------------\n');
    }
  }

  console.log('=== All Tests Completed ===');
}

// Run the tests
runTests(); 