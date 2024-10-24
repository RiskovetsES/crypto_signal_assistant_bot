import TelegramBot from 'node-telegram-bot-api';
import { checkUserAccess } from '../middlewares/authMiddleware';
import { getOrderBook } from '../services/binanceService';
import { formatSupportResistanceMessage } from '../utils/messageFormatter';
import { MESSAGES } from '../utils/messages';

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
    const orderBook = await getOrderBook(symbol);
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

function groupOrderLevels(
  orders: [string, string][],
  thresholdPercentage: number
): { price: number; volume: number }[] {
  const groupedOrders: { price: number; volume: number }[] = [];

  if (orders.length === 0) return groupedOrders;

  orders.sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
  let currentPrice = parseFloat(orders[0][0]);
  let currentVolume = parseFloat(orders[0][1]);

  for (let i = 1; i < orders.length; i++) {
    const price = parseFloat(orders[i][0]);
    const volume = parseFloat(orders[i][1]);
    const priceDifference =
      (Math.abs(price - currentPrice) / currentPrice) * 100;

    if (priceDifference <= thresholdPercentage) {
      currentVolume += volume;
    } else {
      groupedOrders.push({ price: currentPrice, volume: currentVolume });
      currentPrice = price;
      currentVolume = volume;
    }
  }

  groupedOrders.push({ price: currentPrice, volume: currentVolume });
  return groupedOrders;
}

function findSupportAndResistanceLevels(
  orderLevels: { price: number; volume: number }[]
): {
  significantLevels: { price: number; volume: number }[];
  insignificantLevels: { price: number; volume: number }[];
} {
  // Calculate significant and insignificant levels based on dynamic volume threshold
  const significantLevels: { price: number; volume: number }[] = [];
  const insignificantLevels: { price: number; volume: number }[] = [];

  if (orderLevels.length === 0)
    return { significantLevels, insignificantLevels };

  const averageVolume =
    orderLevels.reduce((sum, order) => sum + order.volume, 0) /
    orderLevels.length;
  const volumeThreshold = averageVolume * 2; // Set threshold as twice the average volume
  for (let i = 0; i < orderLevels.length; i++) {
    const level = orderLevels[i];
    // Significant level if volume is more than the dynamic threshold
    if (level.volume > volumeThreshold) {
      significantLevels.push(level);
    } else {
      insignificantLevels.push(level);
    }
  }

  // Filter out potentially spoofed walls for significant levels
  return {
    significantLevels: filterSpoofingLevels(
      orderLevels,
      significantLevels
    ).slice(0, 5), // Return top 5 significant levels
    insignificantLevels,
  };
}

// This function filters out levels that are likely to be spoofed orders (fake walls).
function filterSpoofingLevels(
  orderBookEntries: { price: number; volume: number }[],
  levels: { price: number; volume: number }[]
): { price: number; volume: number }[] {
  const filteredLevels: { price: number; volume: number }[] = [];

  levels.forEach((level) => {
    const matchingEntries = orderBookEntries.filter(
      (entry) => entry.price === level.price
    );
    // If the order has remained consistent, it is less likely to be a spoof
    const consistentOrder = matchingEntries.length > 1;
    if (consistentOrder) {
      filteredLevels.push(level);
    }
  });

  return filteredLevels;
}
