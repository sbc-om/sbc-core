export interface BitcoinCandle {
  openTime: number;
  closeTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BitcoinMarketSnapshot {
  symbol: string;
  lastPrice: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  quoteVolume: number;
  priceChangePercent: number;
  weightedAveragePrice: number;
  candles: BitcoinCandle[];
  asOf: string;
}

export interface BitcoinTrade {
  id: number;
  price: number;
  quantity: number;
  side: "buy" | "sell";
  time: number;
}