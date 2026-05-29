"use server";

import { manifest as baseManifest }      from "@sbc/module-base";
import { manifest as iamManifest }       from "@sbc/module-iam";
import { manifest as documentsManifest } from "@sbc/module-documents";
import { registerMenus, deregisterMenus } from "@sbc/kernel";
import { registerPermissions }           from "@sbc/rbac";
import { revalidatePath }                from "next/cache";
import type { ModuleManifest }           from "@sbc/sdk";

const CORE_MANIFESTS: ModuleManifest[] = [baseManifest, iamManifest, documentsManifest];

/**
 * Wipes and re-registers menus + permissions for all core modules.
 * Run this after bumping a manifest version to push menu changes to the DB.
 */
export async function syncCoreMenusAction(): Promise<{ error?: string }> {
  try {
    for (const manifest of CORE_MANIFESTS) {
      await deregisterMenus(manifest.name);
      if (manifest.menus?.length)       await registerMenus(manifest.name, manifest.menus);
      if (manifest.permissions?.length) await registerPermissions(manifest.name, manifest.permissions);
    }
    revalidatePath("/", "layout");
    revalidatePath("/marketplace");
    revalidatePath("/modules");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Sync failed" };
  }
}
