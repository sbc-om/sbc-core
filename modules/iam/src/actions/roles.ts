"use server";

import { revalidatePath } from "next/cache";
import { CreateRoleSchema, UpdateRoleSchema } from "../schemas/index";
import { createRole, updateRole, deleteRole, setRolePermissions } from "../services/roles";

export async function createRoleAction(formData: FormData) {
  const parsed = CreateRoleSchema.safeParse({
    name:  formData.get("name"),
    label: formData.get("label"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  try {
    await createRole(parsed.data);
    revalidatePath("/roles");
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create role";
    if (msg.includes("unique")) return { error: "Role name already exists" };
    return { error: msg };
  }
}

export async function updateRoleAction(id: string, formData: FormData) {
  const parsed = UpdateRoleSchema.safeParse({ label: formData.get("label") || undefined });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  try {
    await updateRole(id, parsed.data);
    revalidatePath("/roles");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update role" };
  }
}

export async function deleteRoleAction(id: string) {
  await deleteRole(id);
  revalidatePath("/roles");
}

export async function setRolePermissionsAction(roleId: string, permissionIds: string[]) {
  await setRolePermissions(roleId, permissionIds);
  revalidatePath(`/roles/${roleId}`);
}
