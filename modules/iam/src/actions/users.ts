"use server";

import { revalidatePath } from "next/cache";
import { CreateUserSchema, UpdateUserSchema } from "../schemas/index";
import { createUser, updateUser, setUserActive, assignRoleToUser, removeRoleFromUser } from "../services/users";

const SYSTEM_TENANT = "00000000-0000-0000-0000-000000000001";

interface ActionFormData {
  get(name: string): unknown | null;
}

export async function createUserAction(formData: ActionFormData) {
  const parsed = CreateUserSchema.safeParse({
    name:     formData.get("name"),
    email:    formData.get("email"),
    password: formData.get("password"),
    avatarUrl: formData.get("avatarUrl") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  try {
    await createUser(parsed.data, SYSTEM_TENANT);
    revalidatePath("/users");
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create user";
    if (msg.includes("unique")) return { error: "Email already in use" };
    return { error: msg };
  }
}

export async function updateUserAction(id: string, formData: ActionFormData) {
  const parsed = UpdateUserSchema.safeParse({
    name:     formData.get("name") || undefined,
    email:    formData.get("email") || undefined,
    password: formData.get("password") || undefined,
    avatarUrl: formData.get("avatarUrl") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  try {
    await updateUser(id, parsed.data);
    revalidatePath("/users");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update user" };
  }
}

export async function toggleUserActiveAction(id: string, isActive: boolean) {
  await setUserActive(id, isActive);
  revalidatePath("/users");
}

export async function assignRoleAction(userId: string, roleId: string) {
  await assignRoleToUser(userId, roleId, SYSTEM_TENANT);
  revalidatePath(`/users/${userId}`);
}

export async function removeRoleAction(userId: string, roleId: string) {
  await removeRoleFromUser(userId, roleId, SYSTEM_TENANT);
  revalidatePath(`/users/${userId}`);
}
