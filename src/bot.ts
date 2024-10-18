import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const token: string = process.env.TELEGRAM_BOT_TOKEN as string;
const users: string[] = process.env.ALLOWED_USERS?.split(',') || [];

const checkUserAccess = (userId: string | undefined): boolean => {
  if (!userId) return false;
  return users.includes(userId);
};

let isActive: boolean = false;

const bot = new TelegramBot(token, { polling: true });

// run bot command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg?.from?.id.toString();
  if (!checkUserAccess(userId)) {
    bot.sendMessage(chatId, 'You are not allowed to run this bot.');
    return;
  }

  if (isActive) {
    bot.sendMessage(chatId, 'The bot is already running and active.');
  } else {
    isActive = true;
    bot.sendMessage(
      chatId,
      'The bot has been successfully running and is ready to work.'
    );
  }
});

// stop bot command
bot.onText(/\/stop/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg?.from?.id.toString();
  if (!checkUserAccess(userId)) {
    bot.sendMessage(chatId, 'You are not allowed to run this bot.');
    return;
  }

  if (isActive) {
    isActive = false;
    bot.sendMessage(
      chatId,
      'The bot has been successfully stopped. The interaction has been terminated.'
    );
  } else {
    bot.sendMessage(chatId, 'The bot is already stopped.');
  }
});

// Main message handler
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const userId = msg?.from?.id.toString();
  if (!checkUserAccess(userId)) {
    bot.sendMessage(chatId, 'You are not allowed to run this bot.');
    return;
  }

  if (!isActive) {
    return;
  }

  if (msg.text && msg.text !== '/start' && msg.text !== '/stop') {
    bot.sendMessage(chatId, `I received a message: ${msg.text}`);
  }
});
