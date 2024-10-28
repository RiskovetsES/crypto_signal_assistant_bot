import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'https://fapi.binance.com';

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

export async function getCurrentFuturesPrice(symbol: string): Promise<number> {
  try {
    const response = await axios.get(`${BASE_URL}/fapi/v1/ticker/price`, {
      params: { symbol: symbol.toUpperCase() },
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
    });
    return parseFloat(response.data.price);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(`Error fetching futures price for ${symbol}:`, err.message);
    throw new Error('Failed to fetch futures price');
  }
}

export async function getFutures24hPriceChange(symbol: string): Promise<{
  priceChangePercent: string;
  highPrice: string;
  lowPrice: string;
}> {
  try {
    // Fetch 24hr stats from Binance Futures
    const response = await axios.get(`${BASE_URL}/fapi/v1/ticker/24hr`, {
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
      params: {
        symbol: symbol,
      },
    });

    return response.data;
  } catch (err) {
    console.error(err);
    throw new Error(
      `Error fetching data for ${symbol.toUpperCase()}. Please check the symbol and try again.`
    );
  }
}

export async function getFuturesCandlestickData(
  symbol: string,
  period: number,
  interval: string = '4h'
): Promise<number[]> {
  try {
    const response = await axios.get(`${BASE_URL}/fapi/v1/klines`, {
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
      params: {
        symbol: symbol,
        interval,
        limit: period + 1,
      },
    });

    const candlesticks: [
      number,
      string,
      string,
      string,
      string,
      string,
      number,
      string,
      number,
      string,
      string,
      string,
    ][] = response.data;

    // Extract closing prices
    return candlesticks.map((candle) => parseFloat(candle[4]));
  } catch (err) {
    console.error(err);
    throw new Error('Error fetching candlestick data');
  }
}

export async function getFuturesOrderBook(
  symbol: string
): Promise<{ bids: [string, string][]; asks: [string, string][] }> {
  try {
    const response = await axios.get(`${BASE_URL}/fapi/v1/depth`, {
      params: { symbol: symbol.toUpperCase(), limit: 1000 },
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
    });
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(
      `Error fetching futures order book for ${symbol}:`,
      err.message
    );
    throw new Error('Failed to fetch futures order book');
  }
}

export async function getFundingRate(symbol: string): Promise<number> {
  try {
    const response = await axios.get(`${BASE_URL}/fapi/v1/fundingRate`, {
      params: { symbol: symbol.toUpperCase() },
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
    });
    return parseFloat(response.data[0].fundingRate);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(`Error fetching funding rate for ${symbol}:`, err.message);
    throw new Error('Failed to fetch funding rate');
  }
}

export async function getOpenInterest(
  symbol: string,
  period: string = '4h'
): Promise<number> {
  try {
    const response = await axios.get(
      `${BASE_URL}/futures/data/openInterestHist`,
      {
        params: { symbol: symbol.toUpperCase(), period },
        headers: {
          'X-MBX-APIKEY': apiKey,
        },
      }
    );
    return parseFloat(response.data[0].sumOpenInterest);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(`Error fetching open interest for ${symbol}:`, err.message);
    throw new Error('Failed to fetch open interest');
  }
}

export async function getMarkPrice(symbol: string): Promise<number> {
  try {
    const response = await axios.get(`${BASE_URL}/fapi/v1/premiumIndex`, {
      params: { symbol: symbol.toUpperCase() },
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
    });
    return parseFloat(response.data.markPrice);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(`Error fetching mark price for ${symbol}:`, err.message);
    throw new Error('Failed to fetch mark price');
  }
}

export async function getLongShortRatio(
  symbol: string,
  period: string = '4h'
): Promise<number> {
  try {
    const response = await axios.get(
      `${BASE_URL}/futures/data/globalLongShortAccountRatio`,
      {
        params: { symbol: symbol.toUpperCase(), period },
        headers: {
          'X-MBX-APIKEY': apiKey,
        },
      }
    );
    return parseFloat(response.data[0].longShortRatio);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(
      `Error fetching long/short ratio for ${symbol}:`,
      err.message
    );
    throw new Error('Failed to fetch long/short ratio');
  }
}
