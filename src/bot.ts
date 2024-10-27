import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { startHandler } from './handlers/startHandler';
import { stopHandler } from './handlers/stopHandler';
import { priceChangeHandler } from './handlers/priceChangeHandler';
import { smaHandler } from './handlers/smaHandler';
import { supportResistanceHandler } from './handlers/supportResistanceHandler';
import { fundinRateHandler } from './handlers/fundingRateHandler';

dotenv.config();

const token: string = process.env.TELEGRAM_BOT_TOKEN as string;
const bot = new TelegramBot(token, { polling: true });

// Command descriptions
/*
start - Start the bot
stop - Stop the bot
price - Get 24-hour price change for the specified symbol (e.g., /price btc or /price eth)
sma - Get the SMA for a specific period (e.g., /sma BTC 14 1d)
supres - Get the support and resistance levels for the specified symbol (e.g., /supres BTC)
fundin - Get the funding rate for the specified symbol (e.g., /fundin BTC)
*/

// Register command handlers
bot.onText(/\/start/, (msg) => startHandler(bot, msg));
bot.onText(/\/stop/, (msg) => stopHandler(bot, msg));
bot.onText(/\/price (\w+)/, (msg, match) =>
  priceChangeHandler(bot, msg, match)
);
bot.onText(/\/sma (\w+) (\d+) ?(\w+)?/, (msg, match) =>
  smaHandler(bot, msg, match)
);
bot.onText(/\/supres (\w+)/, (msg, match) =>
  supportResistanceHandler(bot, msg, match)
);
bot.onText(/\/fundin (\w+)/, (msg, match) =>
  fundinRateHandler(bot, msg, match)
);
