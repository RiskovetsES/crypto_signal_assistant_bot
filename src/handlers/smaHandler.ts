import TelegramBot from 'node-telegram-bot-api';
import talib from 'ta-lib';
import { checkUserAccess } from '../middlewares/authMiddleware';
import { getCandlestickData } from '../services/binanceService';
import { MESSAGES } from '../utils/messages';

export async function smaHandler(bot: TelegramBot, msg: TelegramBot.Message, match: RegExpExecArray | null) {
  const chatId = msg.chat.id;
  const userId = msg?.from?.id.toString();

  if (!checkUserAccess(userId)) {
    bot.sendMessage(chatId, MESSAGES.ACCESS_DENIED);
    return;
  }

  if (!match?.[2]) {
    bot.sendMessage(chatId, MESSAGES.INVALID_SMA_COMMAND);
    return;
  }

  const symbol = match?.[1];
  const period = parseInt(match?.[2], 10);

  if (!symbol || isNaN(period) || period <= 0) {
    bot.sendMessage(chatId, MESSAGES.INVALID_SMA_COMMAND);
    return;
  }

  try {
    const prices = await getCandlestickData(symbol, period);
    if (prices.length < period) {
      bot.sendMessage(chatId, MESSAGES.NOT_ENOUGH_DATA.replace('{symbol}', symbol));
      return;
    }

    const smaResult = talib.SMA(prices, period);
    const smaValue = smaResult[smaResult.length - 1];
    bot.sendMessage(chatId, MESSAGES.SMA_RESULT
      .replace('{period}', period.toString())
      .replace('{symbol}', symbol.toUpperCase())
      .replace('{smaValue}', smaValue.toString()));
  } catch {
    bot.sendMessage(chatId, MESSAGES.ERROR_FETCHING_DATA.replace('{symbol}', symbol.toUpperCase()));
  }
}