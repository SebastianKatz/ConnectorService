export const handleStart = async (ctx) => {
  console.log('/start command received');
  try {
    await ctx.telegram.sendMessage(ctx.message.chat.id, 'Hello! I am your expense tracking assistant. Send /help to see available commands.');
    console.log('Response to /start command sent');
  } catch (error) {
    console.error('Error responding to /start command:', error);
  }
};

export const handleHelp = async (ctx) => {
  console.log('/help command received');
  try {
    await ctx.telegram.sendMessage(
      ctx.message.chat.id, 
      '🤖 Expense Bot - Available Commands:\n\n' +
      'To register, send:\n' +
      '"I want to register to the application"\n\n' +
      'Once registered, you can:\n' +
      '1. Record expenses by sending messages like:\n' +
      '   - "Bought bread for $100"\n' +
      '   - "Paid $30 for gas"\n' +
      '   - "Taxi $20"\n\n' +
      '2. Use /report to see your expenses from the last 24 hours'
    );
    console.log('Response to /help command sent');
  } catch (error) {
    console.error('Error responding to /help command:', error);
  }
};

export const handleReport = async (ctx) => {
  console.log('/report command received');
  try {
    const message = "/report";
    const telegramId = ctx.from.id.toString();
    const chatId = ctx.message.chat.id;
    const username = ctx.from.username || ctx.from.first_name || 'unknown';
    
    console.log('=== START REPORT PROCESSING ===');
    console.log(`[1] Report requested by ${username} (${telegramId})`);
    
    // Send request to Bot Service
    try {
      let baseUrl = process.env.BOT_SERVICE_URL;
      baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      const processMessageUrl = baseUrl.includes('/api') 
        ? `${baseUrl}/process-message` 
        : `${baseUrl}/api/process-message`;
      
      const response = await fetch(processMessageUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.AUTH_KEY,
        },
        body: JSON.stringify({
          telegram_id: telegramId,
          message: message
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Bot Service Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.should_respond && data.response_message) {
        await ctx.telegram.sendMessage(chatId, data.response_message);
        console.log(`Report sent to ${username}`);
      } else {
        console.log(`No report available or user not registered`);
      }
      
    } catch (error) {
      console.error(`Error getting report:`, error);
      await ctx.telegram.sendMessage(chatId, 'Sorry, I could not generate your expense report right now. Please try again later.');
    }
    
    console.log('=== END REPORT PROCESSING ===');
    
  } catch (error) {
    console.error('Error in report handler:', error);
  }
};

export const handleTextMessage = async (ctx) => {
  console.log('Text message handler activated');
  // Ignore commands
  if (ctx.message.text.startsWith('/')) {
    console.log('Ignoring command message');
    return;
  }
  
  try {
    const message = ctx.message.text;
    const telegramId = ctx.from.id.toString();
    const chatId = ctx.message.chat.id;
    const username = ctx.from.username || ctx.from.first_name || 'unknown';
    
    console.log('=== START MESSAGE PROCESSING ===');
    console.log(`[1] Message received from ${username} (${telegramId}): "${message}"`);
    console.log(`[2] Chat ID: ${chatId}`);
    
    // Send message to Bot Service
    try {
      // Ensure we don't duplicate '/api' in the URL
      let baseUrl = process.env.BOT_SERVICE_URL;
      // Remove trailing slash if present
      baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      // Check if baseUrl already contains '/api'
      const processMessageUrl = baseUrl.includes('/api') 
        ? `${baseUrl}/process-message` 
        : `${baseUrl}/api/process-message`;
      
      console.log(`[3] Attempting to connect to Bot Service at: ${processMessageUrl}`);
      
      const requestBody = {
        telegram_id: telegramId,
        message: message
      };
      console.log(`[4] Sending data to Bot Service:`, requestBody);
      
      const response = await fetch(processMessageUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.AUTH_KEY,
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log(`[5] Response received from Bot Service - Status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`Bot Service Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`[6] Response data:`, data);
      
      // Check if we should respond to the user
      if (data.should_respond && data.response_message) {
        // Send the response message from the Bot Service
        await ctx.telegram.sendMessage(chatId, data.response_message);
        console.log(`[7] Response message sent to ${username}: "${data.response_message}"`);
      } else {
        console.log(`[7] No response needed.`);
      }
      
    } catch (error) {
      console.error(`[ERROR] Error communicating with Bot Service:`, error);
      
      // Send error message to user
      await ctx.telegram.sendMessage(chatId, 'Sorry, I am having trouble processing your message right now. Please try again later.');
      console.log(`Error message sent to ${username}`);
    }
    
    console.log('=== END MESSAGE PROCESSING ===');
    
  } catch (error) {
    console.error('Error in text message handler:', error);
  }
};

export const handleNonTextMessage = async (ctx) => {
  // Only handle non-text messages here
  if (!ctx.message.text) {
    console.log('Received other type of message (non-text)');
    try {
      await ctx.telegram.sendMessage(ctx.message.chat.id, 'I can only process text messages. Please send your expenses as text.');
      console.log('Response to non-text message sent');
    } catch (error) {
      console.error('Error sending response to non-text message:', error);
    }
  }
}; 