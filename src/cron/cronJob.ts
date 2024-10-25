import cron from 'node-cron';
import dotenv from 'dotenv';
import { getOrderBook, getCurrentPrice } from '../services/binanceService';
import { groupOrderLevels, findSupportAndResistanceLevels } from '../services/supportResistanceAnalysis';
import { savePriceHistory, saveOrderBookLevel } from '../services/databaseService';

dotenv.config();

export function scheduleSupportResistanceDataCollection() {
  const symbols = process.env.SYMBOLS?.split(',') || ['BTC'];

  cron.schedule('*/1 * * * *', async () => {
    console.log('Running support and resistance data collection every 15 minutes');
    for (const symbol of symbols) {
      try {
        const symbolWithUsdt = `${symbol.toUpperCase()}USDT`;

        // Get the current price and save it to price_history
        const currentPrice = await getCurrentPrice(symbolWithUsdt);
        savePriceHistory(symbol, currentPrice);

        // Get order book data and calculate support and resistance levels
        const orderBook = await getOrderBook(symbolWithUsdt);
        const groupedBids = groupOrderLevels(orderBook.bids, 0.3);
        const groupedAsks = groupOrderLevels(orderBook.asks, 0.3);
        const { significantLevels: supportLevels, insignificantLevels: insignificantSupportLevels } = findSupportAndResistanceLevels(groupedBids);
        const { significantLevels: resistanceLevels, insignificantLevels: insignificantResistanceLevels } = findSupportAndResistanceLevels(groupedAsks);

        // Save support levels to the database
        supportLevels.forEach((level) => {
          saveOrderBookLevel(symbol, 'support', level.price, level.volume, 'significant');
        });

        insignificantSupportLevels.forEach((level) => {
          saveOrderBookLevel(symbol, 'support', level.price, level.volume, 'insignificant');
        });

        // Save resistance levels to the database
        resistanceLevels.forEach((level) => {
          saveOrderBookLevel(symbol, 'resistance', level.price, level.volume, 'significant');
        });

        insignificantResistanceLevels.forEach((level) => {
          saveOrderBookLevel(symbol, 'resistance', level.price, level.volume, 'insignificant');
        });

        console.log(`Data collected for ${symbol}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error(`Failed to collect data for ${symbol}:`, err.message);
      }
    }
  });
}

// Schedule cron jobs for collecting support and resistance levels independently of the Telegram bot
if (require.main === module) {
  scheduleSupportResistanceDataCollection();
}
