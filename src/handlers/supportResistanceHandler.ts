import TelegramBot from 'node-telegram-bot-api';
import { checkUserAccess } from '../middlewares/authMiddleware';
import { getFuturesOrderBook } from '../services/binanceService';
import { formatSupportResistanceMessage } from '../utils/messageFormatter';
import { MESSAGES } from '../utils/messages';
import {
  findSupportAndResistanceLevels,
  groupOrderLevels,
} from '../services/supportResistanceAnalysis';

export async function supportResistanceHandler(
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

  try {
    const symbolWithUsdt = `${symbol.toUpperCase()}USDT`;
    const orderBook = await getFuturesOrderBook(symbolWithUsdt);
    const groupedBids = groupOrderLevels(orderBook.bids, 0.5);
    const groupedAsks = groupOrderLevels(orderBook.asks, 0.5);
    const {
      significantLevels: supportLevels,
      insignificantLevels: insignificantSupportLevels,
    } = findSupportAndResistanceLevels(groupedBids);
    const {
      significantLevels: resistanceLevels,
      insignificantLevels: insignificantResistanceLevels,
    } = findSupportAndResistanceLevels(groupedAsks);

    const responseMessage = formatSupportResistanceMessage(
      symbol,
      supportLevels,
      insignificantSupportLevels,
      resistanceLevels,
      insignificantResistanceLevels
    );
    bot.sendMessage(chatId, responseMessage, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error(err);
    bot.sendMessage(
      chatId,
      MESSAGES.ERROR_FETCHING_DATA.replace('{symbol}', symbol.toUpperCase())
    );
  }
}
