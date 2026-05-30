"use client";

import { useEffect, useState } from "react";
import { Sparkline } from "./sparkline";
import { formatPercent, formatUsd } from "../lib/format";
import type { BitcoinMarketSnapshot } from "../lib/types";

const STREAM_URL = "wss://stream.binance.com:9443/stream?streams=btcusdt@trade/btcusdt@ticker";

export function BitcoinPriceWidget({ snapshot }: { snapshot: BitcoinMarketSnapshot }) {
  const [price, setPrice] = useState(snapshot.lastPrice);
  const [changePercent, setChangePercent] = useState(snapshot.priceChangePercent);
  const [connected, setConnected] = useState(false);
  const [points, setPoints] = useState<number[]>(() => snapshot.candles.map((candle) => candle.close));

  useEffect(() => {
    const socket = new WebSocket(STREAM_URL);

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onerror = () => setConnected(false);
    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data) as {
        stream?: string;
        data?: Record<string, string | number>;
      };

      if (!payload.data || !payload.stream) return;

      if (payload.stream.endsWith("@ticker")) {
        setPrice(Number(payload.data.c ?? price));
        setChangePercent(Number(payload.data.P ?? changePercent));
        return;
      }

      if (payload.stream.endsWith("@trade")) {
        const tradePrice = Number(payload.data.p ?? price);
        setPrice(tradePrice);
        setPoints((current) => [...current.slice(-31), tradePrice]);
      }
    };

    return () => socket.close();
  }, [changePercent, price]);

  const tone = changePercent >= 0 ? "text-emerald-600" : "text-rose-600";

  return (
    <div className="overflow-hidden rounded-[28px] border border-amber-200/70 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.22),_transparent_34%),linear-gradient(145deg,_rgba(255,251,235,0.95),_rgba(255,255,255,1))] shadow-sm">
      <div className="border-b border-amber-200/70 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Live Market</p>
            <h3 className="mt-1 text-sm font-semibold text-slate-950">Bitcoin Price</h3>
          </div>
          <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${connected ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-border bg-white/80 text-muted-foreground"}`}>
            <span className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-500" : "bg-muted-foreground/50"}`} />
            {connected ? "Live" : "Snapshot"}
          </span>
        </div>
      </div>

      <div className="px-5 py-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-3xl font-semibold tracking-tight text-slate-950">{formatUsd(price)}</p>
            <p className={`mt-1 text-sm font-semibold ${tone}`}>{formatPercent(changePercent)}</p>
          </div>
          <a href="/bitcoin-market" className="rounded-xl border border-border bg-white/85 px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-white">
            Open Desk
          </a>
        </div>

        <Sparkline points={points} className="mt-5 h-20 w-full" />
      </div>
    </div>
  );
}