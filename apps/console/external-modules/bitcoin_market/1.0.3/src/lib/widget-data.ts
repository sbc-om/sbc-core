import { formatCompactNumber, formatPercent, formatUsd } from "./format";
import { getBitcoinMarketSnapshot } from "./market-data";

export async function getBitcoinWidgetData() {
  const snapshot = await getBitcoinMarketSnapshot();
  const isPositive = snapshot.priceChangePercent >= 0;
  const tone = isPositive ? "success" as const : "danger" as const;

  return {
    moduleName: "bitcoin_market",
    title: "Bitcoin Market",
    icon: "bitcoin",
    href: "/bitcoin-market",
    primary: formatUsd(snapshot.lastPrice),
    primaryLabel: "BTC/USDT",
    stats: [
      { label: "24h", value: formatPercent(snapshot.priceChangePercent) },
      { label: "High", value: formatUsd(snapshot.highPrice, 0) },
      { label: "Low", value: formatUsd(snapshot.lowPrice, 0) },
    ],
    badge: {
      label: isPositive ? "Bullish" : "Pullback",
      tone,
    },
    accentTone: tone,
    sparkline: snapshot.candles.map((candle) => candle.close).slice(-24),
    meta: {
      left: formatCompactNumber(snapshot.quoteVolume, 1),
      leftLabel: "24h volume",
      right: formatUsd(snapshot.weightedAveragePrice, 0),
      rightLabel: "VWAP",
    },
  };
}