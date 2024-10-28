import TelegramBot from 'node-telegram-bot-api';
import { checkUserAccess } from '../middlewares/authMiddleware';
import { getLiquidationOrders } from '../services/binanceService';
import { MESSAGES } from '../utils/messages';

export async function liquidationOrdersHandler(
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
  const liquidationVolume = await getLiquidationOrders(symbolWithUsdt);
  const responseMessage = `Liquidation orders volume for ${symbolWithUsdt} is ${liquidationVolume}`;
  bot.sendMessage(chatId, responseMessage);
}
