import { Telegraf } from 'telegraf';
import { BOT_TOKEN } from '../config/bot.config.js';
import { handleStart, handleHelp, handleReport, handleTextMessage, handleNonTextMessage } from '../controllers/bot.controller.js';

// Initialize Telegram bot
export const bot = new Telegraf(BOT_TOKEN);
bot.isRunning = false;

// Function to check if the bot is working
export async function checkBotStatus() {
  try {
    // Try to get bot information to verify the connection
    const botInfo = await bot.telegram.getMe();
    bot.isRunning = true;
    console.log(`Bot verified: @${botInfo.username} (ID: ${botInfo.id})`);
    return true;
  } catch (error) {
    bot.isRunning = false;
    console.error('Error verifying bot status:', error.message);
    return false;
  }
}

// Middleware to log all messages
bot.use((ctx, next) => {
  try {
    const now = new Date().toISOString();
    console.log(`[${now}] Received update type: ${ctx.updateType}`);
    
    if (ctx.from) {
      console.log(`From: ${ctx.from.first_name} ${ctx.from.last_name || ''} (@${ctx.from.username || 'no_username'}) [ID: ${ctx.from.id}]`);
    }
    
    if (ctx.message && ctx.message.text) {
      console.log(`Message: "${ctx.message.text}"`);
    }
    
    // Continue with the next middleware
    return next();
  } catch (error) {
    console.error('Error in middleware:', error);
    return next();
  }
});

// Handle errors
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}`, err);
  console.log('Error context:', {
    updateType: ctx.updateType,
    from: ctx.from ? `${ctx.from.first_name} (ID: ${ctx.from.id})` : 'N/A',
    chat: ctx.chat ? `${ctx.chat.type} (ID: ${ctx.chat.id})` : 'N/A'
  });
});

// Set up command handlers
bot.command('start', handleStart);
bot.command('help', handleHelp);
bot.command('report', handleReport);

// Set up message handlers
bot.hears(/.*/, handleTextMessage);
bot.on('message', handleNonTextMessage);

export async function startBot() {
  try {
    await bot.launch();
    const isBotRunning = await checkBotStatus();
    console.log('Telegram bot started successfully');
    console.log('The bot is ready to receive messages');
    console.log('Bot status:', isBotRunning ? 'ACTIVE' : 'INACTIVE');
  } catch (err) {
    bot.isRunning = false;
    console.error('Error starting Telegram bot:', err);
    console.log('The Express server will continue running even if the bot is not available');
  }
}

export function stopBot() {
  bot.stop('SIGINT');
  console.log('Telegram bot stopped');
} 