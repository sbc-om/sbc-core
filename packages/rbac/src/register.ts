import { db, permissions } from "@sbc/database";
import { eq } from "drizzle-orm";
import type { PermissionDescriptor } from "@sbc/sdk";

export async function registerPermissions(
  module: string,
  descriptors: PermissionDescriptor[]
): Promise<void> {
  if (descriptors.length === 0) return;

  for (const descriptor of descriptors) {
    await db
      .insert(permissions)
      .values({ key: descriptor.key, label: descriptor.label, module })
      .onConflictDoUpdate({
        target: permissions.key,
        set: { label: descriptor.label },
      });
  }
}

export async function deregisterPermissions(module: string): Promise<void> {
  await db.delete(permissions).where(eq(permissions.module, module));
}
