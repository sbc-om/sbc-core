import { db, users, roles, userRoles } from "@sbc/database";
import { eq, desc, count, and } from "drizzle-orm";
import { hashPassword } from "@sbc/auth";
import type { CreateUserInput, UpdateUserInput } from "../schemas/index";

export async function listUsers() {
  return db
    .select({
      id:          users.id,
      name:        users.name,
      email:       users.email,
      avatarUrl:   users.avatarUrl,
      isActive:    users.isActive,
      isSuperAdmin: users.isSuperAdmin,
      lastLoginAt: users.lastLoginAt,
      createdAt:   users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));
}

export async function getUserById(id: string) {
  return db.query.users.findFirst({
    where: eq(users.id, id),
  });
}

export async function getUserWithRoles(id: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  });
  if (!user) return null;

  const assignedRoles = await db
    .select({ id: roles.id, name: roles.name, label: roles.label })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, id));

  return { ...user, roles: assignedRoles };
}

export async function createUser(input: CreateUserInput, tenantId?: string) {
  const passwordHash = await hashPassword(input.password);
  const [user] = await db
    .insert(users)
    .values({
      name: input.name,
      email: input.email,
      passwordHash,
      avatarUrl: input.avatarUrl,
      tenantId: tenantId ?? undefined,
    })
    .returning();
  return user;
}

export async function updateUser(id: string, input: Omit<UpdateUserInput, "avatarUrl"> & { avatarUrl?: string | null }) {
  const set: Partial<typeof users.$inferInsert> = {};
  if (input.name)     set.name = input.name;
  if (input.email)    set.email = input.email;
  if (input.password) set.passwordHash = await hashPassword(input.password);
  if (Object.prototype.hasOwnProperty.call(input, "avatarUrl")) set.avatarUrl = input.avatarUrl ?? null;
  set.updatedAt = new Date();

  const [updated] = await db.update(users).set(set).where(eq(users.id, id)).returning();
  return updated;
}

export async function setUserActive(id: string, isActive: boolean) {
  await db.update(users).set({ isActive, updatedAt: new Date() }).where(eq(users.id, id));
}

export async function assignRoleToUser(userId: string, roleId: string, tenantId: string) {
  await db
    .insert(userRoles)
    .values({ userId, roleId, tenantId })
    .onConflictDoNothing();
}

export async function removeRoleFromUser(userId: string, roleId: string, tenantId: string) {
  await db
    .delete(userRoles)
    .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId), eq(userRoles.tenantId, tenantId)));
}
