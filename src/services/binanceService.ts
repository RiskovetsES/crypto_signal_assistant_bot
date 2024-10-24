import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'https://api.binance.com';

const apiKey = process.env.BINANCE_API_KEY;

export type Candlestick = [
  number, // openTime
  string, // open
  string, // high
  string, // low
  string, // close
  string, // volume
  number, // closeTime
  string, // quoteAssetVolume
  number, // numberOfTrades
  string, // takerBuyBaseAssetVolume
  string, // takerBuyQuoteAssetVolume
  string, // ignore
];

export async function get24hPriceChange(symbol: string): Promise<string> {
  try {
    const symbolWithUsdt = `${symbol.toUpperCase()}USDT`;
    // Fetch 24hr stats from Binance
    const response = await axios.get(`${BASE_URL}/api/v3/ticker/24hr`, {
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
      params: {
        symbol: symbolWithUsdt,
      },
    });

    const { priceChangePercent, highPrice, lowPrice } = response.data;

    return `In the last 24 hours for ${symbol.toUpperCase()}: highest price ${highPrice}, lowest price ${lowPrice}, change ${priceChangePercent}%`;
  } catch (err) {
    console.error(err);
    return `Error fetching data for ${symbol.toUpperCase()}. Please check the symbol and try again.`;
  }
}

export async function getCandlestickData(
  symbol: string,
  period: number,
  interval: string = '4h'
): Promise<number[]> {
  try {
    const symbolWithUsdt = `${symbol.toUpperCase()}USDT`;
    const response = await axios.get(`${BASE_URL}/api/v3/klines`, {
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
      params: {
        symbol: symbolWithUsdt,
        interval,
        limit: period + 1,
      },
    });

    const candlesticks: Candlestick[] = response.data;

    // Extract closing prices
    return candlesticks.map((candle) => parseFloat(candle[4]));
  } catch (err) {
    console.error(err);
    throw new Error('Error fetching candlestick data');
  }
}

export async function getOrderBook(
  symbol: string
): Promise<{ bids: [string, string][]; asks: [string, string][] }> {
  try {
    const symbolWithUsdt = `${symbol.toUpperCase()}USDT`;
    const response = await axios.get(`${BASE_URL}/api/v3/depth`, {
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
      params: {
        symbol: symbolWithUsdt,
        limit: 5000,
      },
    });

    return {
      bids: response.data.bids,
      asks: response.data.asks,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    throw new Error(`Error fetching order book data: ${err.message}`);
  }
}
