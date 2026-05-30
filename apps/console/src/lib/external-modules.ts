import path from "node:path";
import fs from "node:fs/promises";
import { moduleRegistry } from "@sbc/kernel";
import { db } from "@sbc/database";
import { modules } from "@sbc/database";
import { eq } from "drizzle-orm";
import type { ModuleManifest } from "@sbc/sdk";
import { compareModuleVersions } from "@/lib/module-version";

export const EXTERNAL_MODULES_DIR = path.join(process.cwd(), "external-modules");

interface ModuleSource {
  kind: "versioned-external" | "legacy-external";
  manifestPath: string;
  modulePath: string;
}

interface ExternalModuleDescriptor {
  manifest: ModuleManifest;
  source: ModuleSource;
}

function isSemverDirectoryName(value: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(value);
}

async function readManifest(source: ModuleSource): Promise<ModuleManifest | null> {
  try {
    const raw = await fs.readFile(source.manifestPath, "utf-8");
    return JSON.parse(raw) as ModuleManifest;
  } catch {
    return null;
  }
}

async function collectVersionedExternalSources(): Promise<ModuleSource[]> {
  const sources: ModuleSource[] = [];

  try {
    const moduleEntries = await fs.readdir(EXTERNAL_MODULES_DIR, { withFileTypes: true });

    for (const moduleEntry of moduleEntries) {
      if (!moduleEntry.isDirectory()) continue;

      const moduleDir = path.join(EXTERNAL_MODULES_DIR, moduleEntry.name);
      const nestedEntries = await fs.readdir(moduleDir, { withFileTypes: true }).catch(() => []);

      const versionDirectories = nestedEntries.filter((entry) => entry.isDirectory() && isSemverDirectoryName(entry.name));
      if (versionDirectories.length > 0) {
        for (const versionDirectory of versionDirectories) {
          sources.push({
            kind: "versioned-external",
            manifestPath: path.join(moduleDir, versionDirectory.name, "manifest.json"),
            modulePath: path.join(moduleDir, versionDirectory.name),
          });
        }
        continue;
      }

      sources.push({
        kind: "legacy-external",
        manifestPath: path.join(moduleDir, "manifest.json"),
        modulePath: moduleDir,
      });
    }
  } catch {
    // ignore missing external-modules directory
  }

  return sources;
}

async function collectModuleSources(): Promise<ModuleSource[]> {
  return collectVersionedExternalSources();
}

async function getLatestExternalModuleDescriptors(): Promise<ExternalModuleDescriptor[]> {
  const sources = await collectModuleSources();
  const descriptors = new Map<string, ExternalModuleDescriptor>();

  for (const source of sources) {
    const manifest = await readManifest(source);

    if (!manifest) {
      continue;
    }

    if (!manifest.name) {
      console.warn(`[external-modules] Skipping ${source.modulePath}: manifest.name missing or invalid`);
      continue;
    }

    const existing = descriptors.get(manifest.name);
    if (!existing || compareModuleVersions(manifest.version, existing.manifest.version) > 0) {
      descriptors.set(manifest.name, { manifest, source });
    }
  }

  return [...descriptors.values()];
}

export async function getLatestExternalModuleManifest(name: string): Promise<ModuleManifest | null> {
  const descriptors = await getLatestExternalModuleDescriptors();
  const match = descriptors.find((descriptor) => descriptor.manifest.name === name);
  return match?.manifest ?? null;
}

/**
 * Scans disk-backed external module sources and registers every discovered
 * module in the kernel registry. Called once during `bootstrapApp()`.
 */
export async function loadExternalModules(): Promise<void> {
  const descriptors = await getLatestExternalModuleDescriptors();

  for (const { manifest, source } of descriptors) {
    moduleRegistry.register(manifest, source.modulePath, "discovered");

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
  }
}

/**
 * Reads the manifests of all external modules currently on disk.
 * Used by the marketplace page to display uploaded modules alongside the catalog.
 */
export async function listExternalModuleManifests(): Promise<ModuleManifest[]> {
  const descriptors = await getLatestExternalModuleDescriptors();
  return descriptors.map((descriptor) => descriptor.manifest);
}
