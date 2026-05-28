import { db, permissions, rolePermissions, userRoles } from "@sbc/database";
import { eq, and, inArray } from "drizzle-orm";

// In-memory cache: userId:tenantId -> Set<permissionKey>
const permissionCache = new Map<string, { perms: Set<string>; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function cacheKey(userId: string, tenantId: string): string {
  return `${userId}:${tenantId}`;
}

export async function getUserPermissions(
  userId: string,
  tenantId: string
): Promise<Set<string>> {
  const key = cacheKey(userId, tenantId);
  const cached = permissionCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.perms;

  const rows = await db
    .select({ key: permissions.key })
    .from(userRoles)
    .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(and(eq(userRoles.userId, userId), eq(userRoles.tenantId, tenantId)));

  const perms = new Set(rows.map((r) => r.key));
  permissionCache.set(key, { perms, expiresAt: Date.now() + CACHE_TTL_MS });
  return perms;
}

export async function hasPermission(
  userId: string,
  tenantId: string,
  permission: string
): Promise<boolean> {
  const perms = await getUserPermissions(userId, tenantId);
  return perms.has(permission) || perms.has("*");
}

export class PermissionDeniedError extends Error {
  constructor(public readonly permission: string) {
    super(`Permission denied: ${permission}`);
    this.name = "PermissionDeniedError";
  }
}

export async function requirePermission(
  userId: string,
  tenantId: string,
  permission: string
): Promise<void> {
  const granted = await hasPermission(userId, tenantId, permission);
  if (!granted) throw new PermissionDeniedError(permission);
}

export function invalidatePermissionCache(userId: string, tenantId: string): void {
  permissionCache.delete(cacheKey(userId, tenantId));
}

export function invalidateAllPermissionCache(): void {
  permissionCache.clear();
}
