"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { formatCompactNumber, formatPercent, formatTime, formatUsd } from "../lib/format";
import type { BitcoinCandle } from "../lib/types";

const WIDTH = 960;
const HEIGHT = 440;
const CHART_HEIGHT = 304;
const VOLUME_HEIGHT = 72;
const TOP_PADDING = 18;
const BOTTOM_PADDING = 18;
const SIDE_PADDING = 18;
const GAP = 16;
const ZOOM_LEVELS = [12, 24, 36, 48] as const;
const STORAGE_KEY = "bitcoin-market-chart-state";

type ChartTool = "cursor" | "trendline";

interface TrendLine {
  id: string;
  startTime: number;
  endTime: number;
  startPrice: number;
  endPrice: number;
}

interface DraftPoint {
  time: number;
  price: number;
}

interface PersistedChartState {
  visibleCount: (typeof ZOOM_LEVELS)[number];
  tool: ChartTool;
  drawings: TrendLine[];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function BitcoinMarketChart({
  candles,
  lastPrice,
}: {
  candles: BitcoinCandle[];
  lastPrice: number;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [visibleCount, setVisibleCount] = useState<(typeof ZOOM_LEVELS)[number]>(36);
  const [tool, setTool] = useState<ChartTool>("cursor");
  const [drawings, setDrawings] = useState<TrendLine[]>([]);
  const [draftPoint, setDraftPoint] = useState<DraftPoint | null>(null);
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);
  const series = candles.slice(-visibleCount);

  const chart = useMemo(() => {
    if (series.length === 0) return null;

    const high = Math.max(...series.map((candle) => candle.high));
    const low = Math.min(...series.map((candle) => candle.low));
    const priceRange = Math.max(high - low, 1);
    const maxVolume = Math.max(...series.map((candle) => candle.volume), 1);
    const chartBottom = TOP_PADDING + CHART_HEIGHT;
    const volumeTop = chartBottom + GAP;
    const usableWidth = WIDTH - SIDE_PADDING * 2;
    const step = usableWidth / series.length;
    const candleWidth = Math.max(step * 0.56, 6);

    const priceToY = (price: number) => {
      const relative = (price - low) / priceRange;
      return chartBottom - relative * CHART_HEIGHT;
    };

    const yToPrice = (y: number) => {
      const relative = (chartBottom - y) / CHART_HEIGHT;
      return low + clamp(relative, 0, 1) * priceRange;
    };

    const xToIndex = (x: number) => {
      const relative = clamp(x - SIDE_PADDING, 0, usableWidth);
      return clamp(Math.floor(relative / step), 0, series.length - 1);
    };

    const getCandleX = (index: number) => SIDE_PADDING + index * step + step / 2;
    const getCandleByTime = (time: number) => series.findIndex((candle) => candle.openTime === time);

    return {
      high,
      low,
      priceRange,
      maxVolume,
      chartBottom,
      volumeTop,
      step,
      candleWidth,
      priceToY,
      yToPrice,
      xToIndex,
      getCandleX,
      getCandleByTime,
    };
  }, [series]);

  const hoveredCandle = hoveredTime === null ? null : series.find((candle) => candle.openTime === hoveredTime) ?? null;

  const analysis = useMemo(() => {
    if (series.length === 0) return null;

    const first = series[0];
    const last = series[series.length - 1];
    if (!first || !last) return null;
    const lowest = Math.min(...series.map((candle) => candle.low));
    const highest = Math.max(...series.map((candle) => candle.high));
    const trendPercent = ((last.close - first.open) / first.open) * 100;
    const rangePercent = ((highest - lowest) / last.close) * 100;
    const closes = series.slice(-4).map((candle) => candle.close);
    const momentumUp = closes.every((value, index) => index === 0 || value >= (closes[index - 1] ?? value));
    const momentumDown = closes.every((value, index) => index === 0 || value <= (closes[index - 1] ?? value));

    return {
      bias: trendPercent > 0.25 ? "Bullish" : trendPercent < -0.25 ? "Bearish" : "Balanced",
      trendPercent,
      support: lowest,
      resistance: highest,
      volatility: rangePercent > 1.6 ? "Elevated" : "Contained",
      momentum: momentumUp ? "Building" : momentumDown ? "Softening" : "Mixed",
      rangePercent,
    };
  }, [series]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as Partial<PersistedChartState>;
      if (parsed.visibleCount && ZOOM_LEVELS.includes(parsed.visibleCount)) {
        setVisibleCount(parsed.visibleCount);
      }
      if (parsed.tool === "cursor" || parsed.tool === "trendline") {
        setTool(parsed.tool);
      }
      if (Array.isArray(parsed.drawings)) {
        setDrawings(parsed.drawings.filter((drawing): drawing is TrendLine => (
          typeof drawing?.id === "string"
          && typeof drawing.startTime === "number"
          && typeof drawing.endTime === "number"
          && typeof drawing.startPrice === "number"
          && typeof drawing.endPrice === "number"
        )));
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const nextState: PersistedChartState = {
      visibleCount,
      tool,
      drawings,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }, [drawings, tool, visibleCount]);

  if (!chart || !analysis) {
    return (
      <div className="flex h-[380px] items-center justify-center rounded-xl border border-border bg-background text-sm text-muted-foreground lg:h-[540px]">
        No market candles available.
      </div>
    );
  }

  const labelPrices = [chart.high, chart.high - chart.priceRange / 2, chart.low];
  const timeLabels = [series[0], series[Math.floor(series.length / 2)], series[series.length - 1]].filter(
    (candle): candle is BitcoinCandle => Boolean(candle),
  );
  const lastPriceY = chart.priceToY(lastPrice);

  function updateHover(event: MouseEvent<SVGRectElement>) {
    if (!chart) return;
    const bounds = svgRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const x = ((event.clientX - bounds.left) / bounds.width) * WIDTH;
    const index = chart.xToIndex(x);
    setHoveredTime(series[index]?.openTime ?? null);
  }

  function handleChartClick(event: MouseEvent<SVGRectElement>) {
    if (tool !== "trendline") return;
    if (!chart) return;

    const bounds = svgRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const x = ((event.clientX - bounds.left) / bounds.width) * WIDTH;
    const y = ((event.clientY - bounds.top) / bounds.height) * HEIGHT;
    const index = chart.xToIndex(x);
    const candle = series[index];
    if (!candle) return;
    const point = {
      time: candle.openTime,
      price: chart.yToPrice(y),
    };

    if (!draftPoint) {
      setDraftPoint(point);
      return;
    }

    setDrawings((current) => [
      ...current,
      {
        id: `${draftPoint.time}-${point.time}-${current.length}`,
        startTime: draftPoint.time,
        endTime: point.time,
        startPrice: draftPoint.price,
        endPrice: point.price,
      },
    ]);
    setDraftPoint(null);
  }

  function zoomIn() {
    const currentIndex = ZOOM_LEVELS.indexOf(visibleCount);
    const nextZoom = (ZOOM_LEVELS[Math.max(currentIndex - 1, 0)] ?? ZOOM_LEVELS[0]) as (typeof ZOOM_LEVELS)[number];
    setVisibleCount(nextZoom);
  }

  function zoomOut() {
    const currentIndex = ZOOM_LEVELS.indexOf(visibleCount);
    const nextZoom = (ZOOM_LEVELS[Math.min(currentIndex + 1, ZOOM_LEVELS.length - 1)] ?? ZOOM_LEVELS[ZOOM_LEVELS.length - 1]) as (typeof ZOOM_LEVELS)[number];
    setVisibleCount(nextZoom);
  }

  return (
    <div className="rounded-xl border border-border bg-background p-3 shadow-sm sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Market Structure</p>
          <p className="mt-1 text-sm text-foreground">Custom Binance chart with zoom, trend lines, and live structure analysis</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setTool("cursor");
              setDraftPoint(null);
            }}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${tool === "cursor" ? "border-foreground bg-foreground text-background" : "border-border text-foreground hover:bg-muted"}`}
          >
            Cursor
          </button>
          <button
            type="button"
            onClick={() => setTool("trendline")}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${tool === "trendline" ? "border-foreground bg-foreground text-background" : "border-border text-foreground hover:bg-muted"}`}
          >
            Trend Line
          </button>
          <button type="button" onClick={zoomIn} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted" aria-label="Zoom in">
            Zoom +
          </button>
          <button type="button" onClick={zoomOut} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted" aria-label="Zoom out">
            Zoom -
          </button>
          <button
            type="button"
            onClick={() => {
              setVisibleCount(36);
              setDraftPoint(null);
              setDrawings([]);
            }}
            className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => {
              setDraftPoint(null);
              setDrawings([]);
            }}
            className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
            aria-label="Clear drawings"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-4">
        <AnalysisChip label="Bias" value={analysis.bias} accent={analysis.bias === "Bullish" ? "emerald" : analysis.bias === "Bearish" ? "rose" : "slate"} />
        <AnalysisChip label="Trend" value={formatPercent(analysis.trendPercent)} accent={analysis.trendPercent >= 0 ? "emerald" : "rose"} />
        <AnalysisChip label="Volatility" value={analysis.volatility} accent={analysis.volatility === "Elevated" ? "amber" : "slate"} />
        <AnalysisChip label="Momentum" value={analysis.momentum} accent="slate" />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-[linear-gradient(180deg,rgba(148,163,184,0.08),transparent_28%,transparent)]">
        <svg ref={svgRef} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-[360px] w-full lg:h-[520px]" role="img" aria-label="Bitcoin candlestick market chart">
          <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="transparent" />

          {labelPrices.map((label) => {
            const y = chart.priceToY(label);
            return (
              <g key={label}>
                <line x1={SIDE_PADDING} y1={y} x2={WIDTH - SIDE_PADDING} y2={y} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="4 8" />
                <text x={WIDTH - 2} y={y + 4} textAnchor="end" fontSize="12" fill="currentColor" opacity="0.55">
                  {formatUsd(label, 0)}
                </text>
              </g>
            );
          })}

          <line x1={SIDE_PADDING} y1={lastPriceY} x2={WIDTH - SIDE_PADDING} y2={lastPriceY} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.9" />

          {drawings.map((drawing) => {
            const startIndex = chart.getCandleByTime(drawing.startTime);
            const endIndex = chart.getCandleByTime(drawing.endTime);
            if (startIndex === -1 || endIndex === -1) return null;

            return (
              <line
                key={drawing.id}
                x1={chart.getCandleX(startIndex)}
                y1={chart.priceToY(drawing.startPrice)}
                x2={chart.getCandleX(endIndex)}
                y2={chart.priceToY(drawing.endPrice)}
                stroke="#60a5fa"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            );
          })}

          {draftPoint && hoveredCandle ? (
            <line
              x1={chart.getCandleX(chart.getCandleByTime(draftPoint.time))}
              y1={chart.priceToY(draftPoint.price)}
              x2={chart.getCandleX(chart.getCandleByTime(hoveredCandle.openTime))}
              y2={chart.priceToY(hoveredCandle.close)}
              stroke="#60a5fa"
              strokeWidth="2"
              strokeDasharray="6 6"
              strokeLinecap="round"
              opacity="0.9"
            />
          ) : null}

          {series.map((candle, index) => {
            const x = chart.getCandleX(index);
            const openY = chart.priceToY(candle.open);
            const closeY = chart.priceToY(candle.close);
            const highY = chart.priceToY(candle.high);
            const lowY = chart.priceToY(candle.low);
            const isUp = candle.close >= candle.open;
            const bodyY = Math.min(openY, closeY);
            const bodyHeight = Math.max(Math.abs(closeY - openY), 2);
            const bodyColor = isUp ? "#10b981" : "#f43f5e";
            const volumeHeight = (candle.volume / chart.maxVolume) * VOLUME_HEIGHT;
            const volumeY = chart.volumeTop + (VOLUME_HEIGHT - volumeHeight);
            const isHovered = candle.openTime === hoveredTime;

            return (
              <g key={candle.openTime} opacity={hoveredTime === null || isHovered ? 1 : 0.72}>
                <line x1={x} y1={highY} x2={x} y2={lowY} stroke={bodyColor} strokeWidth="2" strokeLinecap="round" opacity="0.95" />
                <rect x={x - chart.candleWidth / 2} y={bodyY} width={chart.candleWidth} height={bodyHeight} rx="2" fill={bodyColor} opacity="0.96" />
                <rect x={x - chart.candleWidth / 2} y={volumeY} width={chart.candleWidth} height={Math.max(volumeHeight, 2)} rx="2" fill={bodyColor} opacity="0.26" />
                {isHovered ? <line x1={x} y1={TOP_PADDING} x2={x} y2={HEIGHT - BOTTOM_PADDING} stroke="currentColor" strokeOpacity="0.16" strokeDasharray="4 8" /> : null}
              </g>
            );
          })}

          <line x1={SIDE_PADDING} y1={chart.volumeTop} x2={WIDTH - SIDE_PADDING} y2={chart.volumeTop} stroke="currentColor" strokeOpacity="0.08" />

          {timeLabels.map((candle, index) => {
            const x = index === 0 ? SIDE_PADDING : index === timeLabels.length - 1 ? WIDTH - SIDE_PADDING : WIDTH / 2;
            const anchor = index === 0 ? "start" : index === timeLabels.length - 1 ? "end" : "middle";
            return (
              <text key={candle.openTime} x={x} y={HEIGHT - BOTTOM_PADDING} textAnchor={anchor} fontSize="12" fill="currentColor" opacity="0.55">
                {formatTime(candle.openTime)}
              </text>
            );
          })}

          <text x={WIDTH - 2} y={chart.volumeTop + 12} textAnchor="end" fontSize="12" fill="currentColor" opacity="0.55">
            {formatCompactNumber(chart.maxVolume, 1)} vol
          </text>

          <rect
            x={SIDE_PADDING}
            y={TOP_PADDING}
            width={WIDTH - SIDE_PADDING * 2}
            height={HEIGHT - TOP_PADDING - BOTTOM_PADDING}
            fill="transparent"
            pointerEvents="all"
            onMouseMove={updateHover}
            onMouseLeave={() => setHoveredTime(null)}
            onClick={handleChartClick}
            style={{ cursor: tool === "trendline" ? "crosshair" : "default" }}
          />
        </svg>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <AnalysisCard label="Support" value={formatUsd(analysis.support, 0)} hint="Visible low" />
        <AnalysisCard label="Resistance" value={formatUsd(analysis.resistance, 0)} hint="Visible high" />
        <AnalysisCard label="Range" value={formatPercent(analysis.rangePercent)} hint="Visible swing" />
      </div>

      {hoveredCandle ? (
        <div className="mt-4 rounded-xl border border-border bg-muted/20 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Candle Inspection</p>
              <p className="mt-1 text-sm text-foreground">{formatTime(hoveredCandle.openTime)}</p>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
              <MetricPair label="Open" value={formatUsd(hoveredCandle.open)} />
              <MetricPair label="High" value={formatUsd(hoveredCandle.high)} />
              <MetricPair label="Low" value={formatUsd(hoveredCandle.low)} />
              <MetricPair label="Close" value={formatUsd(hoveredCandle.close)} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AnalysisChip({ label, value, accent }: { label: string; value: string; accent: "emerald" | "rose" | "amber" | "slate" }) {
  const styles = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300",
    rose: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-300",
    amber: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-300",
    slate: "border-border bg-muted/20 text-foreground",
  } as const;

  return (
    <div className={`rounded-lg border px-3 py-3 ${styles[accent]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-70">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function AnalysisCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function MetricPair({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-foreground">{value}</p>
    </div>
  );
}
