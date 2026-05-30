import { BitcoinLiveMarketClient } from "../components/live-market-client";
import { BitcoinMarketShell, BitcoinMetricCard } from "../components/market-shell";
import { formatCompactNumber, formatPercent, formatUsd } from "../lib/format";
import type { BitcoinMarketSnapshot } from "../lib/types";

export function BitcoinMarketOverviewPage({ snapshot }: { snapshot: BitcoinMarketSnapshot }) {
  return (
    <BitcoinMarketShell
      title="Bitcoin Market"
      metrics={[
        <BitcoinMetricCard key="price" label="Spot" value={formatUsd(snapshot.lastPrice)} hint="BTC/USDT" />,
        <BitcoinMetricCard key="change" label="24h" value={formatPercent(snapshot.priceChangePercent)} hint="Change" />,
        <BitcoinMetricCard key="range" label="Range" value={`${formatUsd(snapshot.lowPrice, 0)} - ${formatUsd(snapshot.highPrice, 0)}`} hint="Low / High" />,
        <BitcoinMetricCard key="volume" label="Volume" value={formatCompactNumber(snapshot.quoteVolume, 2)} hint="USDT" />,
      ]}
    >
      <BitcoinLiveMarketClient snapshot={snapshot} />
    </BitcoinMarketShell>
  );
}