import type { ModuleManifest } from "@sbc/sdk";

export class CircularDependencyError extends Error {
  constructor(public readonly cycle: string[]) {
    super(`Circular dependency detected: ${cycle.join(" → ")}`);
    this.name = "CircularDependencyError";
  }
}

export class MissingDependencyError extends Error {
  constructor(
    public readonly module: string,
    public readonly dependency: string
  ) {
    super(`Module "${module}" requires "${dependency}" but it is not available`);
    this.name = "MissingDependencyError";
  }
}

/**
 * Performs topological sort of module manifests.
 * Returns names in dependency-safe order (dependencies first).
 */
export function topologicalSort(
  manifests: ModuleManifest[],
  targetNames?: string[]
): string[] {
  const manifestMap = new Map(manifests.map((m) => [m.name, m]));
  const names       = targetNames ?? manifests.map((m) => m.name);
  const visited     = new Set<string>();
  const visiting    = new Set<string>();
  const result:     string[] = [];

  function visit(name: string, path: string[]): void {
    if (visited.has(name)) return;
    if (visiting.has(name)) {
      const cycleStart = path.indexOf(name);
      throw new CircularDependencyError([...path.slice(cycleStart), name]);
    }

    visiting.add(name);
    const manifest = manifestMap.get(name);

    if (manifest) {
      const deps = [
        ...(manifest.depends ?? []),
        ...(manifest.optional_depends ?? []).filter((d) => manifestMap.has(d)),
      ];

      for (const dep of deps) {
        if (dep !== "base" && !manifestMap.has(dep)) {
          throw new MissingDependencyError(name, dep);
        }
        if (dep !== "base") {
          visit(dep, [...path, name]);
        }
      }
    }

    visiting.delete(name);
    visited.add(name);
    result.push(name);
  }

  for (const name of names) {
    visit(name, []);
  }

  return result;
}

/**
 * Returns uninstall order — reverse of install order, with dependents first.
 */
export function getUninstallOrder(
  manifests: ModuleManifest[],
  targetNames: string[]
): string[] {
  // Include anything that depends on the targets
  const toRemove = new Set(targetNames);

  for (const manifest of manifests) {
    const deps = manifest.depends ?? [];
    if (deps.some((d) => toRemove.has(d))) {
      toRemove.add(manifest.name);
    }
  }

  const installOrder = topologicalSort(manifests, Array.from(toRemove));
  return [...installOrder].reverse();
}

/**
 * Detects all circular dependency cycles in a set of manifests.
 */
export function detectCircularDeps(manifests: ModuleManifest[]): string[][] {
  const cycles: string[][] = [];

  for (const manifest of manifests) {
    try {
      topologicalSort(manifests, [manifest.name]);
    } catch (err) {
      if (err instanceof CircularDependencyError) {
        cycles.push(err.cycle);
      }
    }
  }

  return cycles;
}
