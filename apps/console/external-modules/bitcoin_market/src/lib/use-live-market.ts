"use client";

import { useEffect, useState } from "react";
import type { BitcoinCandle, BitcoinMarketSnapshot, BitcoinTrade } from "./types";

const STREAM_URL = "wss://stream.binance.com:9443/stream?streams=btcusdt@trade/btcusdt@ticker";

export interface BitcoinLiveMarketState {
  lastPrice: number;
  highPrice: number;
  lowPrice: number;
  priceChangePercent: number;
  weightedAveragePrice: number;
  volume: number;
  quoteVolume: number;
  candles: BitcoinCandle[];
  sparkline: number[];
  trades: BitcoinTrade[];
  connected: boolean;
  updatedAt: number;
}

interface Options {
  sparklineLimit?: number;
  tradeLimit?: number;
}

function createInitialState(
  snapshot: BitcoinMarketSnapshot,
  { sparklineLimit = 60 }: Options = {},
): BitcoinLiveMarketState {
  return {
    lastPrice: snapshot.lastPrice,
    highPrice: snapshot.highPrice,
    lowPrice: snapshot.lowPrice,
    priceChangePercent: snapshot.priceChangePercent,
    weightedAveragePrice: snapshot.weightedAveragePrice,
    volume: snapshot.volume,
    quoteVolume: snapshot.quoteVolume,
    candles: snapshot.candles,
    sparkline: snapshot.candles.map((candle) => candle.close).slice(-sparklineLimit),
    trades: [],
    connected: false,
    updatedAt: new Date(snapshot.asOf).getTime(),
  };
}

function mergeTradeIntoCandles(candles: BitcoinCandle[], price: number, quantity: number, time: number) {
  if (candles.length === 0) return candles;

  const next = [...candles];
  const last = next[next.length - 1];
  if (!last) return candles;
  const minuteStart = Math.floor(time / 60_000) * 60_000;
  const minuteEnd = minuteStart + 59_999;

  if (minuteStart > last.openTime) {
    next.push({
      openTime: minuteStart,
      closeTime: minuteEnd,
      open: last.close,
      high: price,
      low: price,
      close: price,
      volume: quantity,
    });
    return next.slice(-48);
  }

  if (minuteStart < last.openTime) {
    return next;
  }

  next[next.length - 1] = {
    ...last,
    high: Math.max(last.high, price),
    low: Math.min(last.low, price),
    close: price,
    volume: last.volume + quantity,
    closeTime: minuteEnd,
  };

  return next;
}

export function useBitcoinLiveMarket(
  snapshot: BitcoinMarketSnapshot,
  options: Options = {},
): BitcoinLiveMarketState {
  const sparklineLimit = options.sparklineLimit ?? 60;
  const tradeLimit = options.tradeLimit ?? 10;
  const [state, setState] = useState<BitcoinLiveMarketState>(() => createInitialState(snapshot, options));

  useEffect(() => {
    setState(createInitialState(snapshot, options));
  }, [snapshot, sparklineLimit, tradeLimit]);

  useEffect(() => {
    let disposed = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let socket: WebSocket | null = null;

    const connect = () => {
      if (disposed) return;

      socket = new WebSocket(STREAM_URL);

      socket.onopen = () => {
        if (disposed) return;
        setState((current) => ({ ...current, connected: true }));
      };

      socket.onerror = () => {
        if (disposed) return;
        setState((current) => ({ ...current, connected: false }));
      };

      socket.onclose = (event) => {
        if (disposed) return;
        setState((current) => ({ ...current, connected: false }));

        if (!event.wasClean) {
          reconnectTimer = setTimeout(connect, 1500);
        }
      };

      socket.onmessage = (event) => {
        if (disposed) return;

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
          const nextPrice = Number(data.p ?? 0);
          const nextQuantity = Number(data.q ?? 0);
          const nextTime = Number(data.T ?? Date.now());
          const nextId = Number(data.t ?? nextTime);
          const isMaker = Boolean(data.m);

          setState((current) => {
            const tradePrice = Number.isFinite(nextPrice) && nextPrice > 0 ? nextPrice : current.lastPrice;
            const trade: BitcoinTrade = {
              id: nextId,
              price: tradePrice,
              quantity: nextQuantity,
              side: isMaker ? "sell" : "buy",
              time: nextTime,
            };

            return {
              ...current,
              lastPrice: tradePrice,
              candles: mergeTradeIntoCandles(current.candles, tradePrice, nextQuantity, nextTime),
              sparkline: [...current.sparkline.slice(-(sparklineLimit - 1)), tradePrice],
              trades: tradeLimit > 0 ? [trade, ...current.trades].slice(0, tradeLimit) : current.trades,
              updatedAt: trade.time,
            };
          });
        }
      };
    };

    connect();

    return () => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);

      if (socket) {
        const activeSocket = socket;

        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;

        if (activeSocket.readyState === WebSocket.CONNECTING) {
          activeSocket.onopen = () => {
            activeSocket.close(1000, "component disposed");
          };
          return;
        }

        activeSocket.onopen = null;

        if (activeSocket.readyState === WebSocket.OPEN) {
          activeSocket.close(1000, "component disposed");
        }
      }
    };
  }, [snapshot.symbol, sparklineLimit, tradeLimit]);

  return state;
}