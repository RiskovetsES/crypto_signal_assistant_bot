import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'https://api.binance.com';

const apiKey = process.env.BINANCE_API_KEY;

export async function get24hPriceChange(symbol: string): Promise<string> {
  try {
    // Fetch 24hr stats from Binance
    const response = await axios.get(`${BASE_URL}/api/v3/ticker/24hr`, {
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
      params: {
        symbol: symbol.toUpperCase(),
      },
    });

    const { priceChangePercent, highPrice, lowPrice } = response.data;

    return `In the last 24 hours for ${symbol.toUpperCase()}: highest price ${highPrice}, lowest price ${lowPrice}, change ${priceChangePercent}%`;
  } catch {
    return `Error fetching data for ${symbol.toUpperCase()}. Please check the symbol and try again.`;
  }
}
