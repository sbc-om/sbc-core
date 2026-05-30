"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const LOAD_TIMEOUT_MS = 8000;
const TRADING_VIEW_SCRIPT_SRC = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";

function getResolvedTheme() {
  if (typeof document === "undefined") return "light";

  const datasetTheme = document.documentElement.dataset.theme;
  if (datasetTheme === "dark" || datasetTheme === "light") {
    return datasetTheme;
  }

  const storedTheme = window.localStorage.getItem("sbc-theme");
  return storedTheme === "dark" ? "dark" : "light";
}

export function TradingViewChart({
  symbol = "BINANCE:BTCUSDT",
  interval = "15",
}: {
  symbol?: string;
  interval?: string;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const widgetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateTheme = () => {
      setTheme(getResolvedTheme());
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const config = useMemo(() => ({
    autosize: true,
    symbol,
    interval,
    timezone: "Etc/UTC",
    theme,
    style: "1",
    locale: "en",
    withdateranges: true,
    hide_side_toolbar: false,
    allow_symbol_change: true,
    save_image: false,
    details: false,
    hotlist: false,
    calendar: false,
    support_host: "https://www.tradingview.com",
  }), [interval, symbol, theme]);

  useEffect(() => {
    const mountNode = widgetRef.current;
    if (!mountNode) return;

    mountNode.innerHTML = "";
    setLoaded(false);
    setTimedOut(false);

    const script = document.createElement("script");
    script.src = TRADING_VIEW_SCRIPT_SRC;
    script.async = true;
    script.type = "text/javascript";
    script.innerHTML = JSON.stringify(config);
    script.onload = () => {
      setLoaded(true);
      setTimedOut(false);
    };
    script.onerror = () => {
      setTimedOut(true);
    };

    mountNode.appendChild(script);

    return () => {
      mountNode.innerHTML = "";
    };
  }, [config, retryToken]);

  useEffect(() => {
    setLoaded(false);
    setTimedOut(false);

    const timer = window.setTimeout(() => {
      setTimedOut(true);
    }, LOAD_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [config, retryToken]);

  return (
    <div className="relative overflow-hidden rounded-b-xl bg-background">
      {!loaded && !timedOut ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/92 backdrop-blur-sm">
          <div className="space-y-3 px-6 text-center">
            <div className="mx-auto h-10 w-10 animate-pulse rounded-full border border-border bg-muted/60" />
            <div>
              <p className="text-sm font-semibold text-foreground">Loading TradingView</p>
              <p className="mt-1 text-xs text-muted-foreground">Preparing live BTC/USDT chart.</p>
            </div>
          </div>
        </div>
      ) : null}

      {timedOut ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/96 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-background px-5 py-6 text-center shadow-sm">
            <p className="text-sm font-semibold text-foreground">TradingView is taking too long to load</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Your network or browser may be blocking the embedded chart source.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => {
                  setRetryToken((current) => current + 1);
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                Retry
              </button>
              <a
                href="https://www.tradingview.com/symbols/BTCUSDT/?exchange=BINANCE"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-border bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
              >
                Open TradingView
              </a>
            </div>
          </div>
        </div>
      ) : null}

      <div
        ref={widgetRef}
        className="tradingview-widget-container h-[380px] w-full sm:h-[460px] lg:h-[540px] xl:h-[620px]"
      />
    </div>
  );
}