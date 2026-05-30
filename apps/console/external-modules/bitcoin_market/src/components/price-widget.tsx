"use client";

import { formatPercent, formatUsd } from "../lib/format";
import type { BitcoinMarketSnapshot } from "../lib/types";
import { useBitcoinLiveMarket } from "../lib/use-live-market";

export function BitcoinPriceWidget({ snapshot }: { snapshot: BitcoinMarketSnapshot }) {
  const state = useBitcoinLiveMarket(snapshot, { sparklineLimit: 32, tradeLimit: 0 });
  const tone = state.priceChangePercent >= 0 ? "text-emerald-600" : "text-rose-600";

  return (
    <div className="flex flex-col rounded-lg border border-border bg-background">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Bitcoin Market</h3>
          </div>
          <span className={`inline-flex items-center gap-2 rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${state.connected ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-border bg-muted text-muted-foreground"}`}>
            <span className={`h-2 w-2 rounded-full ${state.connected ? "bg-emerald-500" : "bg-muted-foreground/50"}`} />
            {state.connected ? "Live" : "Snapshot"}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center px-5 py-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-3xl font-semibold tracking-tight text-foreground">{formatUsd(state.lastPrice)}</p>
            <p className={`mt-1 text-sm font-semibold ${tone}`}>{formatPercent(state.priceChangePercent)}</p>
          </div>
          <a href="/bitcoin-market" className="rounded-md border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted">
            Open
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-border border-t border-border">
        <div className="px-4 py-3 text-center">
          <p className="text-base font-semibold tabular-nums text-foreground">{formatUsd(state.highPrice, 0)}</p>
          <p className="text-[11px] text-muted-foreground">24h high</p>
        </div>
        <div className="px-4 py-3 text-center">
          <p className="text-base font-semibold tabular-nums text-foreground">{formatUsd(state.lowPrice, 0)}</p>
          <p className="text-[11px] text-muted-foreground">24h low</p>
        </div>
      </div>
    </div>
  );
}