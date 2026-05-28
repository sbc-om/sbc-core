"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db, users } from "@sbc/database";
import { eq } from "drizzle-orm";
import { verifyPassword, createSession, invalidateSession } from "@sbc/auth";
import { SESSION_COOKIE, getSession } from "@/lib/session";
import { SYSTEM_TENANT_ID } from "@/lib/bootstrap";

export type LoginState = { error: string } | { ok: true } | undefined;

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email    = (formData.get("email")    as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null)         ?? "";

  if (!email || !password) return { error: "Email and password are required" };

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });

  if (!user || !user.passwordHash) return { error: "Invalid email or password" };
  if (!user.isActive)               return { error: "Account is inactive. Contact an administrator." };

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { error: "Invalid email or password" };

  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

  const tenantId = user.tenantId ?? SYSTEM_TENANT_ID;
  const token    = await createSession(user.id, tenantId);

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure:   process.env["NODE_ENV"] === "production",
    sameSite: "lax",
    path:     "/",
    maxAge:   7 * 24 * 60 * 60,
  });

  return { ok: true };
}

export async function logoutAction() {
  const session = await getSession();
  if (session) await invalidateSession(session.sessionId);

  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
