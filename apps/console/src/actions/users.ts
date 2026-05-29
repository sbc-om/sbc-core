"use server";

import { revalidatePath } from "next/cache";
import { createUser, updateUser } from "@sbc/module-iam/services";
import { replaceDocumentLink } from "@sbc/module-documents/services";
import { SYSTEM_TENANT_ID } from "@/lib/bootstrap";
import { buildDocumentUrl } from "@/lib/documents";
import { getSessionUser } from "@/lib/session";

type LinkVisibility = "internal" | "tenant" | "public";

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalDocumentId(formData: FormData): string | null {
  const value = getString(formData, "avatarDocumentId");
  return value || null;
}

function getVisibility(formData: FormData): LinkVisibility {
  const value = getString(formData, "avatarVisibility");
  if (value === "public" || value === "tenant") {
    return value;
  }
  return "internal";
}

function buildFileUrl(documentId: string | null, userId: string): string | null {
  if (!documentId) return null;

  return buildDocumentUrl(documentId, {
    tenantId: SYSTEM_TENANT_ID,
    resourceModule: "iam",
    resourceType: "user",
    resourceId: userId,
    fieldName: "avatar",
  });
}

export async function createConsoleUserAction(formData: FormData) {
  const name = getString(formData, "name");
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const avatarDocumentId = getOptionalDocumentId(formData);
  const avatarVisibility = getVisibility(formData);

  if (!name || name.length < 2) return { error: "Name must be at least 2 characters" };
  if (!email) return { error: "Email is required" };
  if (!password || password.length < 8) return { error: "Password must be at least 8 characters" };

  try {
    const actor = await getSessionUser();
    const user = await createUser({
      name,
      email,
      password,
      avatarUrl: undefined,
    }, SYSTEM_TENANT_ID);

    if (!user) {
      throw new Error("User was not created");
    }

    await replaceDocumentLink({
      tenantId: SYSTEM_TENANT_ID,
      userId: actor?.id ?? null,
      ownerUserId: actor?.isSuperAdmin ? undefined : actor?.id,
      documentId: avatarDocumentId,
      resourceModule: "iam",
      resourceType: "user",
      resourceId: user.id,
      fieldName: "avatar",
      linkLabel: "Profile avatar",
      visibility: avatarVisibility,
      sortOrder: 0,
    });

    if (avatarDocumentId) {
      await updateUser(user.id, {
        avatarUrl: buildFileUrl(avatarDocumentId, user.id),
      });
    }

    revalidatePath("/users");
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create user";
    if (msg.includes("unique")) return { error: "Email already in use" };
    return { error: msg };
  }
}

export async function updateConsoleUserAction(id: string, formData: FormData) {
  const name = getString(formData, "name");
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const avatarDocumentId = getOptionalDocumentId(formData);
  const avatarVisibility = getVisibility(formData);

  try {
    const actor = await getSessionUser();
    await updateUser(id, {
      ...(name ? { name } : {}),
      ...(email ? { email } : {}),
      ...(password ? { password } : {}),
      avatarUrl: avatarDocumentId ? buildFileUrl(avatarDocumentId, id) : null,
    });

    await replaceDocumentLink({
      tenantId: SYSTEM_TENANT_ID,
      userId: actor?.id ?? null,
      ownerUserId: actor?.isSuperAdmin ? undefined : actor?.id,
      documentId: avatarDocumentId,
      resourceModule: "iam",
      resourceType: "user",
      resourceId: id,
      fieldName: "avatar",
      linkLabel: "Profile avatar",
      visibility: avatarVisibility,
      sortOrder: 0,
    });

    revalidatePath("/users");
    revalidatePath(`/users/${id}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update user" };
  }
}