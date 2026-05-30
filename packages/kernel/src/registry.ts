import type { ModuleManifest } from "@sbc/sdk";
import type { ModuleState } from "@sbc/database";

export interface ModuleRegistryEntry {
  manifest:          ModuleManifest;
  state:             ModuleState;
  installedVersion:  string | null;
  path:              string;
}

class ModuleRegistry {
  private readonly modules = new Map<string, ModuleRegistryEntry>();

  register(manifest: ModuleManifest, path: string, state: ModuleState = "discovered"): void {
    const existing = this.modules.get(manifest.name);

    this.modules.set(manifest.name, {
      manifest,
      state: existing?.state ?? state,
      installedVersion: existing?.installedVersion ?? null,
      path,
    });
  }

  get(name: string): ModuleRegistryEntry | undefined {
    return this.modules.get(name);
  }

  getAll(): ModuleRegistryEntry[] {
    return Array.from(this.modules.values());
  }

  getInstalled(): ModuleRegistryEntry[] {
    return this.getAll().filter((m) => m.state === "installed");
  }

  getByState(state: ModuleState): ModuleRegistryEntry[] {
    return this.getAll().filter((m) => m.state === state);
  }

  setState(name: string, state: ModuleState): void {
    const entry = this.modules.get(name);
    if (!entry) throw new Error(`Module not found in registry: ${name}`);
    entry.state = state;
  }

  setInstalledVersion(name: string, version: string): void {
    const entry = this.modules.get(name);
    if (!entry) throw new Error(`Module not found in registry: ${name}`);
    entry.installedVersion = version;
  }

  has(name: string): boolean {
    return this.modules.has(name);
  }

  size(): number {
    return this.modules.size;
  }
}

export const moduleRegistry = new ModuleRegistry();
