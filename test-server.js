import express from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Test data
const mockUsers = new Map([
  ['123456789', { name: 'Test User', whitelisted: true }],
  ['987654321', { name: 'Non Whitelisted User', whitelisted: false }]
]);

let requestCount = 0;
const TIMEOUT_MINUTES = 2; // Server will shutdown after this many minutes
const MIN_REQUESTS_BEFORE_AUTO_SHUTDOWN = 4; // Minimum number of requests to process before considering auto-shutdown

// Middleware to log all requests
app.use((req, res, next) => {
  requestCount++;
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] Request #${requestCount}: ${req.method} ${req.path}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'Test server running',
    uptime: process.uptime().toFixed(2) + ' seconds',
    requests_processed: requestCount,
    auto_shutdown: {
      timeout_minutes: TIMEOUT_MINUTES,
      min_requests: MIN_REQUESTS_BEFORE_AUTO_SHUTDOWN,
      remaining_requests: Math.max(0, MIN_REQUESTS_BEFORE_AUTO_SHUTDOWN - requestCount)
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'test-server',
    timestamp: new Date().toISOString(),
    uptime: process.uptime().toFixed(2) + ' seconds',
    requests_processed: requestCount
  });
});

// Process message endpoint
app.post('/api/process-message', (req, res) => {
  console.log('=== RECEIVED MESSAGE REQUEST ===');
  console.log('Body:', req.body);
  
  const { telegram_id, message } = req.body;
  
  // Validate required fields
  if (!telegram_id || !message) {
    console.log('Missing required fields');
    return res.status(400).json({
      success: false,
      error: 'Missing required fields'
    });
  }
  
  // Check if user exists in mock data
  const user = mockUsers.get(telegram_id);
  
  // Simulate processing delay
  setTimeout(() => {
    if (!user) {
      console.log('User not found');
      return res.json({
        success: true,
        user_whitelisted: false,
        response_message: null
      });
    }
    
    if (!user.whitelisted) {
      console.log('User not whitelisted');
      return res.json({
        success: true,
        user_whitelisted: false,
        response_message: null
      });
    }
    
    // Process the message
    console.log('Processing message:', message);
    
    // Simple response based on message content
    let response_message;
    if (message.toLowerCase().includes('hello')) {
      response_message = 'Hello! This is a test response.';
    } else if (message.toLowerCase().includes('help')) {
      response_message = 'This is a test server. Try sending messages with the word "hello".';
    } else {
      response_message = `I received your message: "${message}". This is a test response.`;
    }
    
    console.log('Sending response:', response_message);
    
    res.json({
      success: true,
      user_whitelisted: true,
      response_message
    });
  }, 500); // 500ms delay to simulate processing
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Function to shutdown the server
function shutdownServer(reason) {
  console.log('\n=== SHUTTING DOWN SERVER ===');
  console.log(`Reason: ${reason}`);
  console.log(`Total requests processed: ${requestCount}`);
  console.log('Server uptime:', process.uptime().toFixed(2), 'seconds');
  server.close(() => {
    console.log('Server has been stopped.');
    process.exit(0);
  });
}

// Start server
const PORT = process.env.TEST_SERVER_PORT || 5000;
const server = app.listen(PORT, () => {
  console.clear(); // Clear console
  console.log(`=== TEST SERVER RUNNING ===`);
  console.log(`Server started on port ${PORT}`);
  console.log(`\nTest endpoints:`);
  console.log(`- GET  http://localhost:${PORT}/`);
  console.log(`- GET  http://localhost:${PORT}/health`);
  console.log(`- POST http://localhost:${PORT}/api/process-message`);
  console.log(`\nMock users:`);
  console.log(`- Whitelisted user ID: 123456789`);
  console.log(`- Non-whitelisted user ID: 987654321`);
  console.log(`\nAuto-shutdown configuration:`);
  console.log(`- Server will shutdown after ${TIMEOUT_MINUTES} minutes of inactivity`);
  console.log(`- Server will shutdown after processing ${MIN_REQUESTS_BEFORE_AUTO_SHUTDOWN} requests`);
  console.log(`\nServer is ready and waiting for requests...`);
  console.log(`Press Ctrl+C to stop the server manually`);
});

// Auto-shutdown after timeout
const timeoutId = setTimeout(() => {
  shutdownServer('Timeout reached');
}, TIMEOUT_MINUTES * 60 * 1000);

// Check for auto-shutdown after each request
app.use((req, res, next) => {
  if (requestCount >= MIN_REQUESTS_BEFORE_AUTO_SHUTDOWN) {
    clearTimeout(timeoutId);
    setTimeout(() => {
      shutdownServer('All test requests completed');
    }, 1000); // Give time for the last response to be sent
  }
  next();
});

// Graceful shutdown on Ctrl+C
process.on('SIGINT', () => {
  shutdownServer('Manual shutdown (Ctrl+C)');
});
