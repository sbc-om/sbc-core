import { BitcoinMarketOverviewPage } from "@/../external-modules/bitcoin_market/src";
import { getBitcoinMarketSnapshot } from "@/../external-modules/bitcoin_market/src";

export default async function BitcoinMarketPage() {
  const snapshot = await getBitcoinMarketSnapshot();
  return <BitcoinMarketOverviewPage snapshot={snapshot} />;
}