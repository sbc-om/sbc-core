import { NextRequest, NextResponse } from "next/server";
import { db, users } from "@sbc/database";
import { eq } from "drizzle-orm";
import { verifyPassword, createSession } from "@sbc/auth";
import { SYSTEM_TENANT_ID } from "@/lib/bootstrap";

const COOKIE = "sbc_session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { email?: string; password?: string };
    const email    = body.email?.trim()  ?? "";
    const password = body.password        ?? "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    if (!user.isActive) {
      return NextResponse.json({ error: "Account is inactive." }, { status: 403 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

    const tenantId = user.tenantId ?? SYSTEM_TENANT_ID;
    const token    = await createSession(user.id, tenantId);

    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE, token, {
      httpOnly: true,
      secure:   process.env["NODE_ENV"] === "production",
      sameSite: "lax",
      path:     "/",
      maxAge:   7 * 24 * 60 * 60,
    });
    return res;
  } catch (err) {
    console.error("[login route]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
