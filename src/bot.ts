import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { startHandler } from './handlers/startHandler';
import { stopHandler } from './handlers/stopHandler';
import { priceChangeHandler } from './handlers/priceChangeHandler';
import { smaHandler } from './handlers/smaHandler';
import { supportResistanceHandler } from './handlers/supportResistanceHandler';

dotenv.config();

const token: string = process.env.TELEGRAM_BOT_TOKEN as string;
const bot = new TelegramBot(token, { polling: true });

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
