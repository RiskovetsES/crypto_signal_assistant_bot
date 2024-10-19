import TelegramBot from 'node-telegram-bot-api';
import { checkUserAccess } from '../middlewares/authMiddleware';
import { setActiveState, getActiveState } from '../state/userState';
import { MESSAGES } from '../utils/messages';

export function stopHandler(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  const userId = msg?.from?.id.toString() || '';

  if (!checkUserAccess(userId)) {
    bot.sendMessage(chatId, MESSAGES.ACCESS_DENIED);
    return;
  }

  const isActive = getActiveState(userId);

  if (isActive) {
    setActiveState(userId, false);
    bot.sendMessage(chatId, MESSAGES.BOT_STOPPED);
  } else {
    bot.sendMessage(chatId, MESSAGES.BOT_ALREADY_STOPPED);
  }
}
