import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
// import { messageHandler } from './handlers/messageHandler';
import { startHandler } from './handlers/startHandler';
import { stopHandler } from './handlers/stopHandler';
import { priceChangeHandler } from './handlers/priceChangeHandler';
import { smaHandler } from './handlers/smaHandler';


dotenv.config();

const token: string = process.env.TELEGRAM_BOT_TOKEN as string;
const bot = new TelegramBot(token, { polling: true });

// Register command handlers
bot.onText(/\/start/, (msg) => startHandler(bot, msg));
bot.onText(/\/stop/, (msg) => stopHandler(bot, msg));
bot.onText(/\/(\w+)/, (msg, match) => priceChangeHandler(bot, msg, match));
bot.onText(/\/sma (\w+) (\d+)/, (msg, match) => smaHandler(bot, msg, match));

// Main message handler
// bot.on('message', (msg) => messageHandler(bot, msg));
