import { hasPermission, requirePermission } from "@sbc/rbac";
import { SYSTEM_TENANT_ID } from "@/lib/bootstrap";
import type { SessionUser } from "@/lib/session";

export function getTenantIdForUser(user: SessionUser): string {
  return user.tenantId ?? SYSTEM_TENANT_ID;
}

export async function hasPermissionForUser(
  user: SessionUser,
  permission: string
): Promise<boolean> {
  if (user.isSuperAdmin) return true;
  return hasPermission(user.id, getTenantIdForUser(user), permission);
}

export async function requirePermissionForUser(
  user: SessionUser,
  permission: string
): Promise<void> {
  if (user.isSuperAdmin) return;
  await requirePermission(user.id, getTenantIdForUser(user), permission);
}