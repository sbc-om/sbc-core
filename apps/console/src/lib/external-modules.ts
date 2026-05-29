import path from "node:path";
import fs from "node:fs/promises";
import { moduleRegistry } from "@sbc/kernel";
import { db } from "@sbc/database";
import { modules } from "@sbc/database";
import { eq } from "drizzle-orm";
import type { ModuleManifest } from "@sbc/sdk";

export const EXTERNAL_MODULES_DIR = path.join(process.cwd(), "external-modules");

/**
 * Scans the `external-modules/` directory and registers every discovered
 * module in the kernel registry.  Called once during `bootstrapApp()`.
 */
export async function loadExternalModules(): Promise<void> {
  let entries: import("node:fs").Dirent[];
  try {
    entries = await fs.readdir(EXTERNAL_MODULES_DIR, { withFileTypes: true });
  } catch {
    return; // directory doesn't exist yet — nothing to do
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const manifestPath = path.join(EXTERNAL_MODULES_DIR, entry.name, "manifest.json");

    try {
      const raw  = await fs.readFile(manifestPath, "utf-8");
      const manifest = JSON.parse(raw) as ModuleManifest;

      if (!manifest.name) {
        console.warn(`[external-modules] Skipping ${entry.name}: manifest.name missing`);
        continue;
      }

      // Register in the kernel registry (if not already present)
      if (!moduleRegistry.has(manifest.name)) {
        moduleRegistry.register(
          manifest,
          path.join(EXTERNAL_MODULES_DIR, entry.name),
          "discovered",
        );
      }

      // Sync the DB state into the registry
      const row = await db.query.modules
        .findFirst({ where: eq(modules.name, manifest.name) })
        .catch(() => null);

      if (row) {
        moduleRegistry.setState(
          manifest.name,
          row.state as import("@sbc/database").ModuleState,
        );
        if (row.installedVersion) {
          moduleRegistry.setInstalledVersion(manifest.name, row.installedVersion);
        }
      }

      console.log(`[external-modules] Loaded "${manifest.name}" v${manifest.version}`);
    } catch (err) {
      console.error(`[external-modules] Failed to load "${entry.name}":`, err);
    }
  }
}

/**
 * Reads the manifests of all external modules currently on disk.
 * Used by the marketplace page to display uploaded modules alongside the catalog.
 */
export async function listExternalModuleManifests(): Promise<ModuleManifest[]> {
  const manifests: ModuleManifest[] = [];

  let entries: import("node:fs").Dirent[];
  try {
    entries = await fs.readdir(EXTERNAL_MODULES_DIR, { withFileTypes: true });
  } catch {
    return manifests;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    try {
      const raw = await fs.readFile(
        path.join(EXTERNAL_MODULES_DIR, entry.name, "manifest.json"),
        "utf-8",
      );
      manifests.push(JSON.parse(raw) as ModuleManifest);
    } catch {
      // skip corrupt entries silently
    }
  }

  return manifests;
}
