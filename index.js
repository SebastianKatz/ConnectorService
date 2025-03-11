import express from 'express';
import { PORT } from './config/bot.config.js';
import { startBot, stopBot } from './services/bot.service.js';
import apiRoutes from './routes/api.routes.js';

// Initialize Express
const app = express();
app.use(express.json());

// Configure Express routes
app.use('/', apiRoutes);

// Start Express server first
console.log(`Starting Express server on port ${PORT}...`);
const server = app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}`);
  console.log(`You can access http://localhost:${PORT}/health to check status`);
  
  // Start the bot after the server is running
  console.log('Starting Telegram bot...');
  startBot();
});

// Handle graceful shutdown
process.once('SIGINT', () => {
  console.log('Received SIGINT signal, closing application...');
  server.close(() => {
    console.log('Express server closed');
    stopBot();
    process.exit(0);
  });
});
