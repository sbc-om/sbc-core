import { BitcoinLiveMarketClient } from "../components/live-market-client";
import { BitcoinMarketShell, BitcoinMetricCard } from "../components/market-shell";
import { formatCompactNumber, formatPercent, formatUsd } from "../lib/format";
import type { BitcoinMarketSnapshot } from "../lib/types";

export function BitcoinMarketOverviewPage({ snapshot }: { snapshot: BitcoinMarketSnapshot }) {
  return (
    <BitcoinMarketShell
      eyebrow="Markets"
      title="Bitcoin Live Desk"
      description="A standalone market module that tracks BTC/USDT with a live Binance WebSocket feed, intraday momentum view, and execution-focused context for operators who want a clean read on crypto market movement inside SBC."
      metrics={[
        <BitcoinMetricCard key="price" label="Spot Price" value={formatUsd(snapshot.lastPrice)} hint="Current BTC/USDT spot snapshot" />,
        <BitcoinMetricCard key="change" label="24h Change" value={formatPercent(snapshot.priceChangePercent)} hint="Session momentum from Binance ticker" />,
        <BitcoinMetricCard key="range" label="24h Range" value={`${formatUsd(snapshot.lowPrice, 0)} - ${formatUsd(snapshot.highPrice, 0)}`} hint="Day low to day high" />,
        <BitcoinMetricCard key="volume" label="24h Volume" value={formatCompactNumber(snapshot.quoteVolume, 2)} hint="Quoted USDT turnover" />,
      ]}
    >
      <BitcoinLiveMarketClient snapshot={snapshot} />
    </BitcoinMarketShell>
  );
}