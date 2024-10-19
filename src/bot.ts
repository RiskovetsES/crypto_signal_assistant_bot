import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { messageHandler } from './handlers/messageHandler';
import { startHandler } from './handlers/startHandler';
import { stopHandler } from './handlers/stopHandler';

dotenv.config();

const token: string = process.env.TELEGRAM_BOT_TOKEN as string;
const bot = new TelegramBot(token, { polling: true });

// Register command handlers
bot.onText(/\/start/, (msg) => startHandler(bot, msg));
bot.onText(/\/stop/, (msg) => stopHandler(bot, msg));

// Main message handler
bot.on('message', (msg) => messageHandler(bot, msg));
