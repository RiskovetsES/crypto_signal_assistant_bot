import TelegramBot from 'node-telegram-bot-api';
import { checkUserAccess } from '../middlewares/authMiddleware';
import { getActiveState } from '../state/userState';
import { MESSAGES } from '../utils/messages';

export function messageHandler(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  const userId = msg?.from?.id.toString() || '';

  if (!checkUserAccess(userId)) {
    bot.sendMessage(chatId, MESSAGES.ACCESS_DENIED);
    return;
  }

  const isActive = getActiveState(userId);

  if (!isActive) {
    return; // If the bot is not active, do nothing
  }

  if (msg.text && msg.text !== '/start' && msg.text !== '/stop') {
    bot.sendMessage(chatId, `I received a message: ${msg.text}`);
  }
}
