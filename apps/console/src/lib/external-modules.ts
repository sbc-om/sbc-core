import path from "node:path";
import fs from "node:fs/promises";
import { moduleRegistry } from "@sbc/kernel";
import { db } from "@sbc/database";
import { modules } from "@sbc/database";
import { eq } from "drizzle-orm";
import type { ModuleManifest } from "@sbc/sdk";

export const EXTERNAL_MODULES_DIR = path.join(process.cwd(), "external-modules");
const WORKSPACE_ROOT = path.resolve(process.cwd(), "..", "..");

interface ModuleSource {
  manifestPath: string;
  modulePath: string;
}

async function collectModuleSources(): Promise<ModuleSource[]> {
  const sources: ModuleSource[] = [];

  try {
    const entries = await fs.readdir(EXTERNAL_MODULES_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      sources.push({
        manifestPath: path.join(EXTERNAL_MODULES_DIR, entry.name, "manifest.json"),
        modulePath: path.join(EXTERNAL_MODULES_DIR, entry.name),
      });
    }
  } catch {
    // ignore missing external-modules directory
  }

  try {
    const entries = await fs.readdir(WORKSPACE_ROOT, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || !entry.name.endsWith("-module")) continue;
      sources.push({
        manifestPath: path.join(WORKSPACE_ROOT, entry.name, "manifest.json"),
        modulePath: path.join(WORKSPACE_ROOT, entry.name),
      });
    }
  } catch {
    // ignore inaccessible workspace root
  }

  return sources;
}

/**
 * Scans disk-backed external module sources and registers every discovered
 * module in the kernel registry. Called once during `bootstrapApp()`.
 */
export async function loadExternalModules(): Promise<void> {
  const sources = await collectModuleSources();
  const seen = new Set<string>();

  for (const source of sources) {
    const manifestPath = source.manifestPath;

    try {
      const raw  = await fs.readFile(manifestPath, "utf-8");
      const manifest = JSON.parse(raw) as ModuleManifest;

      if (!manifest.name) {
        console.warn(`[external-modules] Skipping ${source.modulePath}: manifest.name missing`);
        continue;
      }

      if (seen.has(manifest.name)) {
        continue;
      }
      seen.add(manifest.name);

      // Register in the kernel registry (if not already present)
      if (!moduleRegistry.has(manifest.name)) {
        moduleRegistry.register(
          manifest,
          source.modulePath,
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
      console.error(`[external-modules] Failed to load "${source.modulePath}":`, err);
    }
  }
}

/**
 * Reads the manifests of all external modules currently on disk.
 * Used by the marketplace page to display uploaded modules alongside the catalog.
 */
export async function listExternalModuleManifests(): Promise<ModuleManifest[]> {
  const manifests = new Map<string, ModuleManifest>();
  const sources = await collectModuleSources();

  for (const source of sources) {
    try {
      const raw = await fs.readFile(source.manifestPath, "utf-8");
      const manifest = JSON.parse(raw) as ModuleManifest;
      if (manifest.name && !manifests.has(manifest.name)) {
        manifests.set(manifest.name, manifest);
      }
    } catch {
      // skip corrupt entries silently
    }
  }

  return [...manifests.values()];
}
