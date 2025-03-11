import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
export const PORT = process.env.PORT || 3001;
export const BOT_SERVICE_URL = process.env.BOT_SERVICE_URL; 