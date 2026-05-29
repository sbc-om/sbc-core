"use server";

import { revalidatePath } from "next/cache";
import { installModule, uninstallModule, moduleRegistry } from "@sbc/kernel";
import { bootstrapApp, SYSTEM_TENANT_ID } from "@/lib/bootstrap";

export async function installModuleAction(name: string): Promise<{ error?: string }> {
  try {
    await bootstrapApp();
    const entry = moduleRegistry.get(name);
    if (!entry) {
      return { error: `Module "${name}" is not available in this installation. It may not be built yet.` };
    }
    if (entry.state === "installed") {
      return { error: `Module "${name}" is already installed.` };
    }
    await installModule(entry.manifest, { tenantId: SYSTEM_TENANT_ID });
    revalidatePath("/marketplace");
    revalidatePath("/modules");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Install failed" };
  }
}

export async function uninstallModuleAction(name: string): Promise<{ error?: string }> {
  try {
    await bootstrapApp();
    const entry = moduleRegistry.get(name);
    if (!entry) return { error: `Module "${name}" not found in registry.` };
    if (entry.state !== "installed") return { error: `Module "${name}" is not installed.` };
    await uninstallModule(entry.manifest, { tenantId: SYSTEM_TENANT_ID });
    revalidatePath("/marketplace");
    revalidatePath("/modules");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Uninstall failed" };
  }
}
