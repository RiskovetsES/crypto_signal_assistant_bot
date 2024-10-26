import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./data/orderbook.db');

export function savePriceHistory(symbol: string, price: number) {
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
}

export function saveOrderBookLevel(
  symbol: string,
  levelType: string,
  price: number,
  volume: number,
  significance: string
) {
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
}
