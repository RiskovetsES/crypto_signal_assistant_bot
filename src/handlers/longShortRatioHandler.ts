import TelegramBot from 'node-telegram-bot-api';
import { checkUserAccess } from '../middlewares/authMiddleware';
import { getLongShortRatio } from '../services/binanceService';
import { MESSAGES } from '../utils/messages';

export async function longShortRatioHandler(
  bot: TelegramBot,
  msg: TelegramBot.Message,
  match: RegExpExecArray | null
) {
  const chatId = msg.chat.id;
  const userId = msg?.from?.id.toString();
  const allowedPeriods = [
    '5m',
    '15m',
    '30m',
    '1h',
    '2h',
    '4h',
    '6h',
    '12h',
    '1d',
  ];

  if (!checkUserAccess(userId)) {
    bot.sendMessage(chatId, MESSAGES.ACCESS_DENIED);
    return;
  }

  const symbol = match?.[1];
  const period = match?.[2];

  if (!symbol) {
    bot.sendMessage(chatId, MESSAGES.INVALID_SYMBOL);
    return;
  }
  if (period && !allowedPeriods.includes(period)) {
    bot.sendMessage(chatId, MESSAGES.INVALID_PERIOD);
    return;
  }
  const symbolWithUsdt = `${symbol.toUpperCase()}USDT`;
  const longShortRatio = await getLongShortRatio(symbolWithUsdt, period);
  const responseMessage = `Long/Short ratio for ${symbol.toUpperCase()}: ${longShortRatio}`;
  bot.sendMessage(chatId, responseMessage);
}
