"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkline } from "./sparkline";
import { formatBtc, formatCompactNumber, formatPercent, formatTime, formatUsd } from "../lib/format";
import type { BitcoinMarketSnapshot, BitcoinTrade } from "../lib/types";

const STREAM_URL = "wss://stream.binance.com:9443/stream?streams=btcusdt@trade/btcusdt@ticker";

interface LiveState {
  lastPrice: number;
  highPrice: number;
  lowPrice: number;
  priceChangePercent: number;
  weightedAveragePrice: number;
  volume: number;
  quoteVolume: number;
  sparkline: number[];
  trades: BitcoinTrade[];
  connected: boolean;
  updatedAt: number;
}

function createInitialState(snapshot: BitcoinMarketSnapshot): LiveState {
  return {
    lastPrice: snapshot.lastPrice,
    highPrice: snapshot.highPrice,
    lowPrice: snapshot.lowPrice,
    priceChangePercent: snapshot.priceChangePercent,
    weightedAveragePrice: snapshot.weightedAveragePrice,
    volume: snapshot.volume,
    quoteVolume: snapshot.quoteVolume,
    sparkline: snapshot.candles.map((candle) => candle.close),
    trades: [],
    connected: false,
    updatedAt: new Date(snapshot.asOf).getTime(),
  };
}

export function BitcoinLiveMarketClient({ snapshot }: { snapshot: BitcoinMarketSnapshot }) {
  const [state, setState] = useState<LiveState>(() => createInitialState(snapshot));

  useEffect(() => {
    const socket = new WebSocket(STREAM_URL);

    socket.onopen = () => {
      setState((current) => ({ ...current, connected: true }));
    };

    socket.onclose = () => {
      setState((current) => ({ ...current, connected: false }));
    };

    socket.onerror = () => {
      setState((current) => ({ ...current, connected: false }));
    };

    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data) as {
        stream?: string;
        data?: Record<string, string | number | boolean>;
      };

      if (!payload.data || !payload.stream) return;
      const data = payload.data;

      if (payload.stream.endsWith("@ticker")) {
        setState((current) => ({
          ...current,
          lastPrice: Number(data.c ?? current.lastPrice),
          highPrice: Number(data.h ?? current.highPrice),
          lowPrice: Number(data.l ?? current.lowPrice),
          priceChangePercent: Number(data.P ?? current.priceChangePercent),
          weightedAveragePrice: Number(data.w ?? current.weightedAveragePrice),
          volume: Number(data.v ?? current.volume),
          quoteVolume: Number(data.q ?? current.quoteVolume),
          updatedAt: Number(data.E ?? Date.now()),
        }));
        return;
      }

      if (payload.stream.endsWith("@trade")) {
        const price = Number(data.p ?? state.lastPrice);
        const quantity = Number(data.q ?? 0);
        const trade: BitcoinTrade = {
          id: Number(data.t ?? Date.now()),
          price,
          quantity,
          side: data.m ? "sell" : "buy",
          time: Number(data.T ?? Date.now()),
        };

        setState((current) => ({
          ...current,
          lastPrice: price,
          sparkline: [...current.sparkline.slice(-59), price],
          trades: [trade, ...current.trades].slice(0, 10),
          updatedAt: trade.time,
        }));
      }
    };

    return () => socket.close();
  }, [snapshot]);

  const priceTone = state.priceChangePercent >= 0 ? "text-emerald-600" : "text-rose-600";
  const tradeTone = state.priceChangePercent >= 0 ? "bg-emerald-500" : "bg-rose-500";

  const metrics = useMemo(() => [
    { label: "24h High", value: formatUsd(state.highPrice) },
    { label: "24h Low", value: formatUsd(state.lowPrice) },
    { label: "VWAP", value: formatUsd(state.weightedAveragePrice) },
    { label: "Volume", value: formatCompactNumber(state.volume, 2) },
  ], [state.highPrice, state.lowPrice, state.weightedAveragePrice, state.volume]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[28px] border border-amber-200/80 bg-[linear-gradient(135deg,_rgba(255,251,235,0.96),_rgba(255,255,255,1))] p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-100/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-800">
                  BTC / USDT
                </span>
                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${state.connected ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-border bg-muted text-muted-foreground"}`}>
                  <span className={`h-2 w-2 rounded-full ${state.connected ? "bg-emerald-500" : "bg-muted-foreground/50"}`} />
                  {state.connected ? "Live Binance Stream" : "Snapshot Mode"}
                </span>
              </div>
              <div className="mt-5 flex flex-wrap items-end gap-3">
                <p className="text-5xl font-semibold tracking-tight text-slate-950">{formatUsd(state.lastPrice)}</p>
                <p className={`pb-1 text-lg font-semibold ${priceTone}`}>{formatPercent(state.priceChangePercent)}</p>
              </div>
              <p className="mt-3 text-sm text-slate-600">Updated {formatTime(state.updatedAt)} · Direct public stream from Binance</p>
            </div>

            <div className="grid min-w-[240px] grid-cols-2 gap-3 lg:max-w-sm">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-amber-200/70 bg-white/85 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{metric.label}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-amber-200/70 bg-slate-950/95 p-4 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/80">Intraday Momentum</p>
                <p className="mt-1 text-sm text-slate-300">Rolling trade ticks over the last live samples.</p>
              </div>
              <div className={`h-2.5 w-2.5 rounded-full ${tradeTone}`} />
            </div>
            <Sparkline points={state.sparkline} stroke="#fbbf24" fill="rgba(251, 191, 36, 0.14)" className="mt-4 h-44 w-full" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <InfoCard label="Quote Volume" value={formatUsd(state.quoteVolume, 0)} hint="24h notional traded" />
          <InfoCard label="Average Fill" value={formatUsd(state.weightedAveragePrice)} hint="Volume-weighted average price" />
          <InfoCard label="Trade Bias" value={state.priceChangePercent >= 0 ? "Risk-On" : "Risk-Off"} hint="Derived from current 24h momentum" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-[28px] border border-border bg-background p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Recent Trades</p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">Tape Reader</h2>
            </div>
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
              <div key={trade.id} className="grid grid-cols-[1fr_auto] gap-3 rounded-2xl border border-border p-3">
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
              <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                Waiting for the first live trade packet.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Execution Notes</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
            <li>This module uses Binance public REST for initial candles and the public WebSocket stream for sub-second trade updates.</li>
            <li>If the stream drops, the page keeps rendering the last snapshot cleanly and marks the feed as snapshot mode.</li>
            <li>No API key is required, so the module remains independent and safe to package as an external installable module.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-3xl border border-border bg-background p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}