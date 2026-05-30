"use client";

import { useMemo } from "react";
import { BitcoinMarketChart } from "./market-chart";
import { formatBtc, formatCompactNumber, formatPercent, formatTime, formatUsd } from "../lib/format";
import type { BitcoinMarketSnapshot } from "../lib/types";
import { useBitcoinLiveMarket } from "../lib/use-live-market";

export function BitcoinLiveMarketClient({ snapshot }: { snapshot: BitcoinMarketSnapshot }) {
  const state = useBitcoinLiveMarket(snapshot);

  const priceTone = state.priceChangePercent >= 0 ? "text-emerald-600" : "text-rose-600";

  const metrics = useMemo(() => [
    { label: "24h High", value: formatUsd(state.highPrice) },
    { label: "24h Low", value: formatUsd(state.lowPrice) },
    { label: "VWAP", value: formatUsd(state.weightedAveragePrice) },
    { label: "Volume", value: formatCompactNumber(state.volume, 2) },
  ], [state.highPrice, state.lowPrice, state.weightedAveragePrice, state.volume]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
      <div className="space-y-6">
        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
          <div className="flex flex-col gap-5 border-b border-border px-4 py-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-md border border-border bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">
                  BTC / USDT
                </span>
                <span className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${state.connected ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-border bg-muted text-muted-foreground"}`}>
                  <span className={`h-2 w-2 rounded-full ${state.connected ? "bg-emerald-500" : "bg-muted-foreground/50"}`} />
                  {state.connected ? "Live" : "Snapshot"}
                </span>
              </div>
              <div className="mt-5 flex flex-wrap items-end gap-3">
                <p className="text-4xl font-semibold tracking-tight text-foreground">{formatUsd(state.lastPrice)}</p>
                <p className={`pb-1 text-lg font-semibold ${priceTone}`}>{formatPercent(state.priceChangePercent)}</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{formatTime(state.updatedAt)}</p>
            </div>

            <div className="grid min-w-[240px] grid-cols-2 gap-3 lg:max-w-sm">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-lg border border-border bg-muted/20 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{metric.label}</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-muted/10 p-2 sm:p-3">
            <BitcoinMarketChart candles={state.candles} lastPrice={state.lastPrice} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <InfoCard label="Quote Volume" value={formatUsd(state.quoteVolume, 0)} hint="24h" />
          <InfoCard label="Average" value={formatUsd(state.weightedAveragePrice)} hint="VWAP" />
          <InfoCard label="Bias" value={state.priceChangePercent >= 0 ? "Risk-On" : "Risk-Off"} hint="Momentum" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-sm font-semibold text-foreground">Recent Trades</h2>
            <a
              href="https://www.binance.com/en/trade/BTC_USDT"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
            >
              Open Binance
            </a>
          </div>

          <div className="mt-4 space-y-3">
            {state.trades.length > 0 ? state.trades.map((trade) => (
              <div key={trade.id} className="grid grid-cols-[1fr_auto] gap-3 rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{formatUsd(trade.price)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatTime(trade.time)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${trade.side === "buy" ? "text-emerald-600" : "text-rose-600"}`}>{trade.side.toUpperCase()}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatBtc(trade.quantity)}</p>
                </div>
              </div>
            )) : (
              <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                Waiting for trades.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}