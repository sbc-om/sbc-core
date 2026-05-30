import { NextResponse } from "next/server";
import { getBitcoinMarketSnapshot } from "@/../external-modules/bitcoin_market/src";

export async function GET() {
  const snapshot = await getBitcoinMarketSnapshot();
  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}