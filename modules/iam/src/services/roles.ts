import { db, roles, permissions, rolePermissions, userRoles } from "@sbc/database";
import { eq, and, count } from "drizzle-orm";
import type { CreateRoleInput, UpdateRoleInput } from "../schemas/index";

export async function listRoles() {
  const rows = await db
    .select({
      id:        roles.id,
      name:      roles.name,
      label:     roles.label,
      isSystem:  roles.isSystem,
      createdAt: roles.createdAt,
    })
    .from(roles)
    .orderBy(roles.label);

  const [permCounts, userCounts] = await Promise.all([
    db.select({ roleId: rolePermissions.roleId, cnt: count() })
      .from(rolePermissions)
      .groupBy(rolePermissions.roleId),
    db.select({ roleId: userRoles.roleId, cnt: count() })
      .from(userRoles)
      .groupBy(userRoles.roleId),
  ]);

  const permMap = new Map(permCounts.map((c) => [c.roleId, c.cnt]));
  const userMap = new Map(userCounts.map((c) => [c.roleId, c.cnt]));

  return rows.map((r) => ({
    ...r,
    permissionCount: permMap.get(r.id) ?? 0,
    userCount:       userMap.get(r.id) ?? 0,
  }));
}

export async function getRoleWithPermissions(id: string) {
  const role = await db.query.roles.findFirst({ where: eq(roles.id, id) });
  if (!role) return null;

  const assigned = await db
    .select({ id: permissions.id, key: permissions.key, label: permissions.label, module: permissions.module })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, id));

  return { ...role, permissions: assigned };
}

export async function listAllPermissions() {
  return db
    .select({ id: permissions.id, key: permissions.key, label: permissions.label, module: permissions.module })
    .from(permissions)
    .orderBy(permissions.module, permissions.key);
}

export async function createRole(input: CreateRoleInput, tenantId?: string) {
  const [role] = await db
    .insert(roles)
    .values({ name: input.name, label: input.label, tenantId, isSystem: false })
    .returning();
  return role;
}

export async function updateRole(id: string, input: UpdateRoleInput) {
  const [updated] = await db
    .update(roles)
    .set({ ...(input.label ? { label: input.label } : {}), updatedAt: new Date() })
    .where(eq(roles.id, id))
    .returning();
  return updated;
}

export async function deleteRole(id: string) {
  await db.delete(userRoles).where(eq(userRoles.roleId, id));
  await db.delete(rolePermissions).where(eq(rolePermissions.roleId, id));
  await db.delete(roles).where(eq(roles.id, id));
}

export async function setRolePermissions(roleId: string, permissionIds: string[]) {
  await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
  if (permissionIds.length === 0) return;
  await db.insert(rolePermissions).values(permissionIds.map((pid) => ({ roleId, permissionId: pid })));
}
