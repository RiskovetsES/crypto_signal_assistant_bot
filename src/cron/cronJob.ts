import cron from 'node-cron';
import dotenv from 'dotenv';
import { getCurrentFuturesPrice, getFundingRate, getOpenInterest, getMarkPrice, getLiquidationOrders } from '../services/binanceService';
import { collectAndSaveSupportResistanceLevels } from '../services/supportResistanceAnalysis';
import { savePriceHistory, saveMarketIndicator } from '../services/databaseService';

dotenv.config();

export function scheduleSupportResistanceDataCollection() {
  const symbols = process.env.SYMBOLS?.split(',') || ['BTC'];

  cron.schedule('*/1 * * * *', async () => {
    console.log('Running support and resistance data collection every minute');
    for (const symbol of symbols) {
      try {
        const symbolWithUsdt = `${symbol.toUpperCase()}USDT`;

        // Get the current price and save it to price_history
        const currentPrice = await getCurrentFuturesPrice(symbolWithUsdt);
        savePriceHistory(symbol, currentPrice);

        // Extract order book data and save levels to the database
        await collectAndSaveSupportResistanceLevels(symbol, symbolWithUsdt);

        // Collect market indicators
        const fundingRate = await getFundingRate(symbolWithUsdt);
        const openInterest = await getOpenInterest(symbolWithUsdt);
        const markPrice = await getMarkPrice(symbolWithUsdt);
        // const topLiquidations = await getLiquidationOrders(symbolWithUsdt);

        // Save market indicators to the database
        saveMarketIndicator(symbol, fundingRate, openInterest, markPrice);

        console.log(`Data collected for ${symbol}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err:any) {
        console.error(`Failed to collect data for ${symbol}:`, err.message);
      }
    }
  });
}

// Schedule cron jobs for collecting support and resistance levels independently of the Telegram bot
if (require.main === module) {
  scheduleSupportResistanceDataCollection();
}
