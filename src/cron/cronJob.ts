import cron from 'node-cron';
import dotenv from 'dotenv';
import { getOrderBook } from '../services/binanceService';
import { groupOrderLevels, findSupportAndResistanceLevels } from '../services/supportResistanceAnalysis';
import sqlite3 from 'sqlite3';

dotenv.config();

const db = new sqlite3.Database('../data/orderbook.db');

export function scheduleCronJobs() {
  const symbols = process.env.SYMBOLS?.split(',') || ['BTCUSDT'];

  cron.schedule('*/10 * * * *', async () => {
    console.log('Running support and resistance data collection every 10 minutes');
    for (const symbol of symbols) {
      try {
        const orderBook = await getOrderBook(symbol);
        const groupedBids = groupOrderLevels(orderBook.bids, 0.5);
        const groupedAsks = groupOrderLevels(orderBook.asks, 0.5);
        const { significantLevels: supportLevels, insignificantLevels: insignificantSupportLevels } = findSupportAndResistanceLevels(groupedBids);
        const { significantLevels: resistanceLevels, insignificantLevels: insignificantResistanceLevels } = findSupportAndResistanceLevels(groupedAsks);

        // Save support levels to the database
        supportLevels.forEach((level) => {
          db.run(
            `INSERT INTO orderbook (symbol, levelType, price, volume, significance) VALUES (?, ?, ?, ?, ?)`,
            [symbol, 'support', level.price, level.volume, 'significant']
          );
        });

        insignificantSupportLevels.forEach((level) => {
          db.run(
            `INSERT INTO orderbook (symbol, levelType, price, volume, significance) VALUES (?, ?, ?, ?, ?)`,
            [symbol, 'support', level.price, level.volume, 'insignificant']
          );
        });

        // Save resistance levels to the database
        resistanceLevels.forEach((level) => {
          db.run(
            `INSERT INTO orderbook (symbol, levelType, price, volume, significance) VALUES (?, ?, ?, ?, ?)`,
            [symbol, 'resistance', level.price, level.volume, 'significant']
          );
        });

        insignificantResistanceLevels.forEach((level) => {
          db.run(
            `INSERT INTO orderbook (symbol, levelType, price, volume, significance) VALUES (?, ?, ?, ?, ?)`,
            [symbol, 'resistance', level.price, level.volume, 'insignificant']
          );
        });

        console.log(`Data collected for ${symbol}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error(`Failed to collect data for ${symbol}:`, err.message);
      }
    }
  });
}