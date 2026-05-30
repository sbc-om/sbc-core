"use server";

import path from "node:path";
import { revalidatePath } from "next/cache";
import { installModule, uninstallModule, upgradeModule, moduleRegistry } from "@sbc/kernel";
import { db, modules } from "@sbc/database";
import { eq } from "drizzle-orm";
import { bootstrapApp, SYSTEM_TENANT_ID } from "@/lib/bootstrap";
import { getLatestExternalModuleManifest } from "@/lib/external-modules";
import { compareModuleVersions } from "@/lib/module-version";

export async function installModuleAction(name: string): Promise<{ error?: string }> {
  try {
    await bootstrapApp();
    const entry = moduleRegistry.get(name);
    if (!entry) {
      return { error: `Module "${name}" is not available in this installation. It may not be built yet.` };
    }

    const dbRecord = await db.query.modules.findFirst({ where: eq(modules.name, name) }).catch(() => null);
    const currentState = (dbRecord?.state as typeof entry.state | undefined) ?? entry.state;
    const currentInstalledVersion = dbRecord?.installedVersion ?? entry.installedVersion;

    const latestExternalManifest = await getLatestExternalModuleManifest(name);
    const targetManifest = latestExternalManifest ?? entry.manifest;
    const targetPath = latestExternalManifest ? entry.path : entry.path;
    const hasNewerVersion = !!currentInstalledVersion && compareModuleVersions(targetManifest.version, currentInstalledVersion) > 0;

    if (currentState === "installed" && !hasNewerVersion) {
      return { error: `Module "${name}" is already installed.` };
    }

    // For external modules (on disk), pass the migrations directory so the
    // kernel runs their .sql migration files during install.
    const migrationsDir = targetPath
      ? path.join(targetPath, "migrations")
      : undefined;

    if (dbRecord?.state) {
      moduleRegistry.setState(name, dbRecord.state as typeof entry.state);
    }
    if (currentInstalledVersion) {
      moduleRegistry.setInstalledVersion(name, currentInstalledVersion);
    }

    if (currentState === "installed" && currentInstalledVersion && hasNewerVersion) {
      moduleRegistry.register(targetManifest, targetPath, currentState);
      await upgradeModule(targetManifest, currentInstalledVersion, { tenantId: SYSTEM_TENANT_ID });
    } else {
      moduleRegistry.register(targetManifest, targetPath, currentState);
      await installModule(targetManifest, { tenantId: SYSTEM_TENANT_ID, migrationsDir });
    }

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
    const dbRecord = await db.query.modules.findFirst({ where: eq(modules.name, name) }).catch(() => null);
    const currentState = (dbRecord?.state as typeof entry.state | undefined) ?? entry.state;
    if (dbRecord?.state) {
      moduleRegistry.setState(name, dbRecord.state as typeof entry.state);
    }
    if (dbRecord?.installedVersion) {
      moduleRegistry.setInstalledVersion(name, dbRecord.installedVersion);
    }
    if (currentState !== "installed") return { error: `Module "${name}" is not installed.` };
    await uninstallModule(entry.manifest, { tenantId: SYSTEM_TENANT_ID });
    revalidatePath("/marketplace");
    revalidatePath("/modules");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Uninstall failed" };
  }
}
