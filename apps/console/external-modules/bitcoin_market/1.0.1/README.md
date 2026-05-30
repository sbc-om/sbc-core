# Bitcoin Market Module

Standalone external module for SBC Core that adds a live BTC/USDT desk powered by Binance public market data.

## Features

- Live BTC/USDT price feed over Binance WebSocket
- Intraday sparkline with rolling trade updates
- 24h range, VWAP, and liquidity metrics
- Live dashboard widget for the SBC dashboard
- Packaged as an external installable module with `manifest.json`

## Build zip

```bash
pnpm --dir bitcoin-market-module build:zip
```

The generated archive can be uploaded from the Marketplace upload dialog.