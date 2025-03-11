export const handleStart = async (ctx) => {
  console.log('/start command received');
  try {
    await ctx.telegram.sendMessage(ctx.message.chat.id, 'Hello! I am ready to process your messages.');
    console.log('Response to /start command sent');
  } catch (error) {
    console.error('Error responding to /start command:', error);
  }
};

export const handleHelp = async (ctx) => {
  console.log('/help command received');
  try {
    await ctx.telegram.sendMessage(ctx.message.chat.id, 'Send me text messages and I will process them.');
    console.log('Response to /help command sent');
  } catch (error) {
    console.error('Error responding to /help command:', error);
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
      if (data.success && data.response_message) {
        // Send the response message from the Bot Service
        await ctx.telegram.sendMessage(chatId, data.response_message);
        console.log(`[7] Response message sent to ${username}: "${data.response_message}"`);
      } else if (!data.user_whitelisted) {
        console.log(`[7] User not in whitelist. No response sent.`);
      } else {
        console.log(`[7] No response message available.`);
      }
      
    } catch (error) {
      console.error(`[ERROR] Error communicating with Bot Service:`, error);
      
      // Send error message to user
      await ctx.telegram.sendMessage(chatId, 'Sorry, I could not process your message at this time. Please try again later.');
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
      await ctx.telegram.sendMessage(ctx.message.chat.id, 'I can only process text messages at this time.');
      console.log('Response to non-text message sent');
    } catch (error) {
      console.error('Error sending response to non-text message:', error);
    }
  }
}; 