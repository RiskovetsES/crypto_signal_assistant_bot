import cron from 'node-cron';
import dotenv from 'dotenv';
import { getCurrentPrice, getOrderBook } from '../services/binanceService';
import {
  groupOrderLevels,
  findSupportAndResistanceLevels,
} from '../services/supportResistanceAnalysis';
import sqlite3 from 'sqlite3';

dotenv.config();

const db = new sqlite3.Database('./data/orderbook.db');

export function scheduleCronJobs() {
  const symbols = process.env.SYMBOLS?.split(',') || ['BTC'];

  cron.schedule('*/1 * * * *', async () => {
    console.log(
      'Running support and resistance data collection every 10 minutes'
    );
    for (const symbol of symbols) {
      try {
        const symbolWithUsdt = `${symbol.toUpperCase()}USDT`;
        // Get the current price and save it to price_history
        const currentPrice = await getCurrentPrice(symbolWithUsdt);
        db.run(
          `INSERT INTO price_history (symbol, price) VALUES (?, ?)`,
          [symbol, currentPrice],
          function (err) {
            if (err) {
              return console.error(`Failed to insert current price for ${symbol}:`, err.message);
            }
            console.log(`Inserted current price for ${symbol}: ${currentPrice}`);
          }
        );
        const orderBook = await getOrderBook(symbolWithUsdt);
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

        // Save support levels to the database
        supportLevels.forEach((level) => {
          db.run(
            `INSERT INTO orderbook (symbol, levelType, price, volume, significance) VALUES (?, ?, ?, ?, ?)`,
            [symbol, 'support', level.price, level.volume.toFixed(2), 'significant']
          );
        });

        insignificantSupportLevels.forEach((level) => {
          db.run(
            `INSERT INTO orderbook (symbol, levelType, price, volume, significance) VALUES (?, ?, ?, ?, ?)`,
            [symbol, 'support', level.price, level.volume.toFixed(2), 'insignificant']
          );
        });

        // Save resistance levels to the database
        resistanceLevels.forEach((level) => {
          db.run(
            `INSERT INTO orderbook (symbol, levelType, price, volume, significance) VALUES (?, ?, ?, ?, ?)`,
            [symbol, 'resistance', level.price, level.volume.toFixed(2), 'significant']
          );
        });

        insignificantResistanceLevels.forEach((level) => {
          db.run(
            `INSERT INTO orderbook (symbol, levelType, price, volume, significance) VALUES (?, ?, ?, ?, ?)`,
            [symbol, 'resistance', level.price, level.volume.toFixed(2), 'insignificant']
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

// Schedule cron jobs for collecting support and resistance levels independently of the Telegram bot
if (require.main === module) {
  scheduleCronJobs();
}
