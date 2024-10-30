import sqlite3 from 'sqlite3';

export function savePriceHistory(symbol: string, price: number) {
  const db = new sqlite3.Database('./data/orderbook.db');

  db.run(
    `INSERT INTO price_history (symbol, price) VALUES (?, ?)`,
    [symbol, price],
    function (err) {
      if (err) {
        console.error(
          `Failed to insert current price for ${symbol}:`,
          err.message
        );
      } else {
        console.log(`Inserted current price for ${symbol}: ${price}`);
      }
    }
  );

  db.close((err) => {
    if (err) {
      console.error('Failed to close the database connection:', err.message);
    }
  });
}

export function saveOrderBookLevel(
  symbol: string,
  levelType: string,
  price: number,
  volume: number,
  significance: string
) {
  const db = new sqlite3.Database('./data/orderbook.db');

  db.run(
    `INSERT INTO orderbook (symbol, levelType, price, volume, significance) VALUES (?, ?, ?, ?, ?)`,
    [symbol, levelType, price, volume, significance],
    function (err) {
      if (err) {
        console.error(
          `Failed to insert ${levelType} level for ${symbol}:`,
          err.message
        );
      }
    }
  );

  db.close((err) => {
    if (err) {
      console.error('Failed to close the database connection:', err.message);
    }
  });
}

export function saveMarketIndicator(
  symbol: string,
  fundingRate: number,
  openInterest: number,
  markPrice: number
) {
  const db = new sqlite3.Database('./data/orderbook.db');

  db.run(
    `INSERT INTO market_indicators (symbol, fundingRate, openInterest, markPrice, timestamp) VALUES (?, ?, ?, ?, datetime('now'))`,
    [symbol, fundingRate, openInterest, markPrice],
    function (err) {
      if (err) {
        console.error('Error saving market indicators:', err.message);
      } else {
        console.log(`Market indicators saved for ${symbol}`);
      }
    }
  );

  db.close((err) => {
    if (err) {
      console.error('Failed to close the database connection:', err.message);
    };
  });
}
