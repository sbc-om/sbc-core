import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateSession } from "@sbc/auth";

export async function GET() {
  const store  = await cookies();
  const token  = store.get("sbc_session")?.value ?? null;
  const secret = process.env["AUTH_SECRET"] ?? null;

  let session = null;
  let error   = null;
  if (token) {
    try {
      session = await validateSession(token);
    } catch (e) {
      error = String(e);
    }
  }

  return NextResponse.json({
    hasToken:       !!token,
    tokenPrefix:    token?.substring(0, 20),
    secretPrefix:   secret?.substring(0, 10),
    session,
    error,
  });
}
