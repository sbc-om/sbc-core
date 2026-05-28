import { db, sessions, users } from "@sbc/database";
import { eq, and, gt } from "drizzle-orm";
import { generateSessionToken, hashToken, signToken, verifyToken } from "./token";

export interface SessionResult {
  userId:   string;
  tenantId: string | null;
  sessionId: string;
}

export async function createSession(
  userId: string,
  tenantId: string | null,
  options?: { ipAddress?: string; userAgent?: string }
): Promise<string> {
  const token     = generateSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const [session] = await db
    .insert(sessions)
    .values({
      userId,
      tokenHash,
      expiresAt,
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
    })
    .returning({ id: sessions.id });

  if (!session) throw new Error("Failed to create session");

  return signToken({ userId, tenantId, sessionId: session.id });
}

export async function validateSession(token: string): Promise<SessionResult | null> {
  try {
    const payload = await verifyToken(token);
    const tokenHash = hashToken(token.split(".")[2] ?? "");

    const session = await db.query.sessions.findFirst({
      where: and(
        eq(sessions.id, payload.sessionId),
        gt(sessions.expiresAt, new Date())
      ),
    });

    if (!session) return null;

    return {
      userId:    payload.userId,
      tenantId:  payload.tenantId,
      sessionId: payload.sessionId,
    };
  } catch {
    return null;
  }
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function invalidateAllUserSessions(userId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

export async function getUserFromSession(sessionResult: SessionResult) {
  return db.query.users.findFirst({
    where: eq(users.id, sessionResult.userId),
  });
}
