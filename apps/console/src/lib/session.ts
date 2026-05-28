import { cookies } from "next/headers";
import { validateSession, type SessionResult } from "@sbc/auth";
import { db, users } from "@sbc/database";
import { eq } from "drizzle-orm";

export const SESSION_COOKIE = "sbc_session";

export async function getSession(): Promise<SessionResult | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return validateSession(token);
}

export async function getSessionUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
    columns: { id: true, name: true, email: true, isActive: true, isSuperAdmin: true, tenantId: true },
  });

  if (!user?.isActive) return null;
  return { ...user, sessionId: session.sessionId, tenantId: session.tenantId ?? user.tenantId };
}

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getSessionUser>>>;
