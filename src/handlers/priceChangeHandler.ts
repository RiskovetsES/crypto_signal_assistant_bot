import TelegramBot from 'node-telegram-bot-api';
import { checkUserAccess } from '../middlewares/authMiddleware';
import { getFutures24hPriceChange } from '../services/binanceService';
import { MESSAGES } from '../utils/messages';

export async function priceChangeHandler(
  bot: TelegramBot,
  msg: TelegramBot.Message,
  match: RegExpExecArray | null
) {
  const chatId = msg.chat.id;
  const userId = msg?.from?.id.toString();

  if (!checkUserAccess(userId)) {
    bot.sendMessage(chatId, MESSAGES.ACCESS_DENIED);
    return;
  }

  const symbol = match?.[1];

  if (!symbol) {
    bot.sendMessage(chatId, MESSAGES.INVALID_SYMBOL);
    return;
  }
  const symbolWithUsdt = `${symbol.toUpperCase()}USDT`;
  const { priceChangePercent, highPrice, lowPrice } =
    await getFutures24hPriceChange(symbolWithUsdt);
  const responseMessage = `In the last 24 hours for ${symbol.toUpperCase()}: highest price ${highPrice}, lowest price ${lowPrice}, change ${priceChangePercent}%`;
  bot.sendMessage(chatId, responseMessage);
}
