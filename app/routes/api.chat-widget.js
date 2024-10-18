// app/routes/api/chatbot-config.js
import { json } from '@remix-run/node';

export const loader = async () => {
  // Fetch the bot configuration from a database, environment variables, or another service
  const botKey = process.env.BOT_KEY || 'defaultBotKey';
  const chatboxSrc = 'https://assets.tomai.vn/plugins/chatbox-script.js';

  return json({
    bot_key: botKey,
    chatbox_src: chatboxSrc,
  });
};
