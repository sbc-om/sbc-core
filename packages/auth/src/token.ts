import { SignJWT, jwtVerify } from "jose";
import { createHash, randomBytes } from "crypto";

const secret = new TextEncoder().encode(
  process.env["AUTH_SECRET"] ?? "fallback-secret-change-in-production"
);

export interface TokenPayload {
  userId:   string;
  tenantId: string | null;
  sessionId: string;
}

export async function signToken(payload: TokenPayload, expiresIn = "7d"): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as TokenPayload;
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
