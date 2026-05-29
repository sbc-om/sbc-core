import { db, modules } from "@sbc/database";
import { eq, and, desc, isNull } from "drizzle-orm";
import path from "node:path";
import type { ModuleManifest } from "@sbc/sdk";
import type { ModuleState } from "@sbc/database";
import { moduleRegistry } from "./registry";
import { topologicalSort, getUninstallOrder } from "./resolver";
import { registerMenus, deregisterMenus } from "./menus";
import { registerPermissions, deregisterPermissions } from "@sbc/rbac";
import { eventBus } from "@sbc/events";
import { defineEvent } from "@sbc/sdk";
import { runSqlFileMigrations } from "./sql-migrations";
import { z } from "zod";

const moduleInstalledEvent = defineEvent({
  name:   "kernel.module.installed",
  schema: z.object({ module: z.string(), version: z.string() }),
});

const moduleUpgradedEvent = defineEvent({
  name:   "kernel.module.upgraded",
  schema: z.object({ module: z.string(), fromVersion: z.string(), toVersion: z.string() }),
});

const moduleUninstalledEvent = defineEvent({
  name:   "kernel.module.uninstalled",
  schema: z.object({ module: z.string() }),
});

async function setState(
  moduleName: string,
  state: ModuleState,
  tenantId?: string,
  error?: string
): Promise<void> {
  moduleRegistry.setState(moduleName, state);
  await db
    .update(modules)
    .set({ state, error: error ?? null, updatedAt: new Date() })
    .where(
      and(
        eq(modules.name, moduleName),
        tenantId ? eq(modules.tenantId, tenantId) : undefined as never
      )
    );
}

async function findLatestModuleRecord(moduleName: string, tenantId?: string) {
  const scope = tenantId ? eq(modules.tenantId, tenantId) : isNull(modules.tenantId);

  const [row] = await db
    .select()
    .from(modules)
    .where(and(eq(modules.name, moduleName), scope))
    .orderBy(desc(modules.updatedAt), desc(modules.createdAt))
    .limit(1);

  return row;
}

export async function installModule(
  manifest: ModuleManifest,
  options?: { tenantId?: string; installDemoData?: boolean; migrationsDir?: string }
): Promise<void> {
  const allManifests = moduleRegistry.getAll().map((e) => e.manifest);
  const installOrder = topologicalSort(allManifests, [manifest.name]);

  for (const moduleName of installOrder) {
    const entry = moduleRegistry.get(moduleName);
    if (!entry) continue;
    if (entry.state === "installed") continue;

    const mod = entry.manifest;
    const tenantId = options?.tenantId;

    try {
      await setState(moduleName, "to_install", tenantId);

      const existingRecord = await findLatestModuleRecord(moduleName, tenantId);

      if (existingRecord) {
        await db
          .update(modules)
          .set({
            title: mod.title,
            version: mod.version,
            state: "to_install",
            error: null,
            updatedAt: new Date(),
          })
          .where(eq(modules.id, existingRecord.id));
      } else {
        await db
          .insert(modules)
          .values({ name: mod.name, title: mod.title, version: mod.version, tenantId, state: "to_install" });
      }

      await setState(moduleName, "installing", tenantId);

      // Run SQL file migrations for external modules
      const migrationsDir =
        options?.migrationsDir ??
        (moduleRegistry.get(moduleName)?.path
          ? path.join(moduleRegistry.get(moduleName)!.path, "migrations")
          : undefined);

      if (migrationsDir) {
        await runSqlFileMigrations(moduleName, migrationsDir);
      }

      if (mod.permissions?.length) {
        await registerPermissions(moduleName, mod.permissions);
      }

      if (mod.menus?.length) {
        await registerMenus(moduleName, mod.menus, tenantId);
      }

      await db
        .update(modules)
        .set({ state: "installed", installedVersion: mod.version, installedAt: new Date(), updatedAt: new Date() })
        .where(eq(modules.name, moduleName));

      moduleRegistry.setState(moduleName, "installed");
      moduleRegistry.setInstalledVersion(moduleName, mod.version);

      await eventBus.publish(moduleInstalledEvent, { module: moduleName, version: mod.version }, {
        tenantId: tenantId ?? null,
        sourceModule: "kernel",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await setState(moduleName, "error", tenantId, message);
      throw err;
    }
  }
}

export async function uninstallModule(
  manifest: ModuleManifest,
  options?: { tenantId?: string; removeData?: boolean }
): Promise<void> {
  const allManifests = moduleRegistry.getAll().map((e) => e.manifest);
  const uninstallOrder = getUninstallOrder(allManifests, [manifest.name]);

  for (const moduleName of uninstallOrder) {
    const tenantId = options?.tenantId;

    try {
      await setState(moduleName, "to_uninstall", tenantId);
      await setState(moduleName, "uninstalling", tenantId);

      await deregisterMenus(moduleName);
      await deregisterPermissions(moduleName);
      eventBus.unsubscribeModule(moduleName);

      await db
        .update(modules)
        .set({ state: "uninstalled", updatedAt: new Date() })
        .where(eq(modules.name, moduleName));

      moduleRegistry.setState(moduleName, "uninstalled");

      await eventBus.publish(moduleUninstalledEvent, { module: moduleName }, {
        tenantId: tenantId ?? null,
        sourceModule: "kernel",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await setState(moduleName, "error", tenantId, message);
      throw err;
    }
  }
}

export async function upgradeModule(
  manifest: ModuleManifest,
  fromVersion: string,
  options?: { tenantId?: string }
): Promise<void> {
  const tenantId = options?.tenantId;
  const moduleName = manifest.name;

  try {
    await setState(moduleName, "to_upgrade", tenantId);
    await setState(moduleName, "upgrading", tenantId);

    if (manifest.permissions?.length) {
      await registerPermissions(moduleName, manifest.permissions);
    }

    if (manifest.menus?.length) {
      await deregisterMenus(moduleName);
      await registerMenus(moduleName, manifest.menus, tenantId);
    }

    await db
      .update(modules)
      .set({ state: "installed", installedVersion: manifest.version, updatedAt: new Date() })
      .where(eq(modules.name, moduleName));

    moduleRegistry.setState(moduleName, "installed");
    moduleRegistry.setInstalledVersion(moduleName, manifest.version);

    await eventBus.publish(moduleUpgradedEvent, { module: moduleName, fromVersion, toVersion: manifest.version }, {
      tenantId: tenantId ?? null,
      sourceModule: "kernel",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await setState(moduleName, "error", tenantId, message);
    throw err;
  }
}
