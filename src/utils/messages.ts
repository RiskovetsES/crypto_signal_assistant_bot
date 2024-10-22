export const MESSAGES = {
  ACCESS_DENIED: 'You are not allowed to run this bot.',
  BOT_RUNNING: 'The bot has been successfully started and is ready to work.',
  BOT_ALREADY_RUNNING: 'The bot is already running and active.',
  BOT_STOPPED: 'The bot has been successfully stopped. The interaction has been terminated.',
  BOT_ALREADY_STOPPED: 'The bot is already stopped.',
  INVALID_SYMBOL: 'Please specify a valid cryptocurrency symbol. Example command: /24h BTCUSDT',
  INVALID_SMA_COMMAND: 'Please specify a valid symbol and period. Example command: /sma BTCUSDT 14',
  NOT_ENOUGH_DATA: 'Not enough data to calculate SMA for {symbol}.',
  ERROR_CALCULATING_SMA: 'Error calculating SMA for {symbol}.',
  SMA_RESULT: 'The {period}-period SMA for {symbol} is {smaValue}',
  ERROR_FETCHING_DATA: 'Error fetching data for {symbol}. Please check the symbol and try again.',
};