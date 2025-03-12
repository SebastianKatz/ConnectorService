import express from 'express';
import { checkBotStatus } from '../bot.client.js';

const router = express.Router();

// Root endpoint
router.get('/', (req, res) => {
  res.send('Connector Service server running correctly');
});

// Health endpoint
router.get('/health', async (req, res) => {
  // Actively check if the bot is running
  const isBotRunning = await checkBotStatus();
  
  console.log('Request to /health - Bot status:', isBotRunning ? 'ACTIVE' : 'INACTIVE');
  
  res.status(200).json({ 
    status: 'ok',
    botRunning: isBotRunning,
    timestamp: new Date().toISOString()
  });
});

export default router; 