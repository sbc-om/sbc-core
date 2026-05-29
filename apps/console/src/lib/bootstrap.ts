import { manifest as baseManifest }      from "@sbc/module-base";
import { manifest as contactsManifest }  from "@sbc/module-contacts";
import { manifest as documentsManifest } from "@sbc/module-documents";
import { manifest as iamManifest }       from "@sbc/module-iam";
import { loadExternalModules }           from "@/lib/external-modules";
import {
  moduleRegistry,
  installModule,
  upgradeModule,
  registerMenus,
  deregisterMenus,
} from "@sbc/kernel";
import { registerPermissions } from "@sbc/rbac";
import { db, modules, tenants, users } from "@sbc/database";
import { eq } from "drizzle-orm";
import { hashPassword } from "@sbc/auth";
import type { ModuleManifest } from "@sbc/sdk";

export const SYSTEM_TENANT_ID = "00000000-0000-0000-0000-000000000001";
// Core modules are always installed. Installable modules (like contacts) are
// registered in the registry so the marketplace can discover and install them.
const CORE_MODULES: ModuleManifest[]        = [baseManifest, iamManifest, documentsManifest];
const INSTALLABLE_MODULES: ModuleManifest[] = [contactsManifest];

let bootstrapped = false;

async function ensureSystemTenant(): Promise<void> {
  const existing = await db.query.tenants.findFirst({ where: eq(tenants.id, SYSTEM_TENANT_ID) });
  if (existing) return;
  await db.execute(
    `INSERT INTO tenants (id, name, slug, plan, is_active)
     VALUES ('${SYSTEM_TENANT_ID}', 'System', 'system', 'enterprise', true)
     ON CONFLICT DO NOTHING`
  );
  console.warn("[sbc] system tenant created");
}

const ADMIN_EMAIL = "admin@sbc.local";

async function ensureSuperAdmin(): Promise<void> {
  const existing = await db.query.users.findFirst({ where: eq(users.email, ADMIN_EMAIL) });
  if (existing) return;

  const passwordHash = await hashPassword("admin123");
  await db.insert(users).values({
    name:         "Administrator",
    email:        ADMIN_EMAIL,
    passwordHash,
    tenantId:     SYSTEM_TENANT_ID,
    isActive:     true,
    isSuperAdmin: true,
  }).onConflictDoNothing();

  console.warn(`[sbc] super admin created | email: ${ADMIN_EMAIL}  password: admin123`);
}

async function ensureInstalled(manifest: ModuleManifest): Promise<void> {
  if (!moduleRegistry.has(manifest.name)) {
    moduleRegistry.register(manifest, `modules/${manifest.name}`, "discovered");
  }

  const existing = await db.query.modules.findFirst({ where: eq(modules.name, manifest.name) });

  if (existing?.state === "installed") {
    moduleRegistry.setState(manifest.name, "installed");

    const dbVersion = existing.installedVersion ?? existing.version;
    if (dbVersion && dbVersion !== manifest.version) {
      moduleRegistry.setInstalledVersion(manifest.name, dbVersion);
      console.warn(`[sbc] upgrading "${manifest.name}" ${dbVersion} → ${manifest.version}`);
      await upgradeModule(manifest, dbVersion);
    } else if (existing.installedVersion) {
      moduleRegistry.setInstalledVersion(manifest.name, existing.installedVersion);
    }
    return;
  }

  await installModule(manifest, {});
  console.warn(`[sbc] module "${manifest.name}" installed`);
}

/**
 * Wipes and re-registers menus + permissions for every core module from the
 * current manifest. Runs on every cold start so the DB always reflects the
 * manifests — no manual Sync Menus needed after manifest changes.
 */
async function syncCoreMenus(): Promise<void> {
  for (const manifest of CORE_MODULES) {
    await deregisterMenus(manifest.name);
    if (manifest.menus?.length)       await registerMenus(manifest.name, manifest.menus);
    if (manifest.permissions?.length) await registerPermissions(manifest.name, manifest.permissions);
  }
  console.warn("[sbc] core menus synced");
}

export async function bootstrapApp(): Promise<void> {
  if (bootstrapped) return;
  bootstrapped = true;

  try { await ensureSystemTenant(); } catch (err) { console.error("[sbc] tenant error:", err); }

  for (const manifest of CORE_MODULES) {
    try { await ensureInstalled(manifest); } catch (err) { console.error(`[sbc] module "${manifest.name}" error:`, err); }
  }

  // Register installable modules in the registry so the marketplace can see them.
  // They are NOT auto-installed; the user installs them from the marketplace.
  for (const manifest of INSTALLABLE_MODULES) {
    if (!moduleRegistry.has(manifest.name)) {
      moduleRegistry.register(manifest, `modules/${manifest.name}`, "discovered");
    }
    // Sync DB state into the registry (installed, uninstalled, etc.)
    const existing = await db.query.modules.findFirst({ where: eq(modules.name, manifest.name) }).catch(() => null);
    if (existing) {
      moduleRegistry.setState(manifest.name, existing.state as import("@sbc/database").ModuleState);
      if (existing.installedVersion) moduleRegistry.setInstalledVersion(manifest.name, existing.installedVersion);
    }
  }

  try { await loadExternalModules(); } catch (err) { console.error("[sbc] external modules error:", err); }
  try { await syncCoreMenus(); }       catch (err) { console.error("[sbc] menu sync error:", err); }
  try { await ensureSuperAdmin(); }    catch (err) { console.error("[sbc] admin error:", err); }
}
