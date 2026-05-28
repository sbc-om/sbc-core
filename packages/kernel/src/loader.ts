import { db, modules as modulesTable } from "@sbc/database";
import type { ModuleManifest } from "@sbc/sdk";
import { moduleRegistry } from "./registry";
import { topologicalSort, detectCircularDeps } from "./resolver";
import { upgradeModule } from "./installer";

/**
 * Bootstraps the kernel by loading all registered modules in dependency order.
 * Syncs registry state with the database and triggers upgrades for outdated modules.
 */
export async function bootstrapKernel(): Promise<void> {
  const cycles = detectCircularDeps(
    moduleRegistry.getAll().map((e) => e.manifest)
  );

  if (cycles.length > 0) {
    const formatted = cycles.map((c) => c.join(" → ")).join("\n");
    throw new Error(`Circular dependencies detected:\n${formatted}`);
  }

  const dbModules = await db.select().from(modulesTable);
  const dbMap     = new Map(dbModules.map((m) => [m.name, m]));

  for (const entry of moduleRegistry.getAll()) {
    const dbRecord = dbMap.get(entry.manifest.name);
    if (dbRecord) {
      moduleRegistry.setState(
        entry.manifest.name,
        dbRecord.state as import("@sbc/database").ModuleState
      );
      if (dbRecord.installedVersion) {
        moduleRegistry.setInstalledVersion(
          entry.manifest.name,
          dbRecord.installedVersion
        );
      }
    }
  }

  // Trigger upgrades for modules with a newer version
  const installed = moduleRegistry.getInstalled();
  for (const entry of installed) {
    const { manifest, installedVersion } = entry;
    if (installedVersion && installedVersion !== manifest.version) {
      console.warn(
        `[kernel] Module ${manifest.name}: upgrade ${installedVersion} → ${manifest.version}`
      );
      await upgradeModule(manifest, installedVersion);
    }
  }
}

/**
 * Returns all registered manifests in load order.
 */
export function getLoadOrder(): ModuleManifest[] {
  const all       = moduleRegistry.getAll().map((e) => e.manifest);
  const sortedNames = topologicalSort(all);
  return sortedNames
    .map((n) => moduleRegistry.get(n)?.manifest)
    .filter((m): m is ModuleManifest => m !== undefined);
}
