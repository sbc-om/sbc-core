import { manifest as baseManifest } from "@sbc/module-base";
import { manifest as iamManifest }  from "@sbc/module-iam";
import { moduleRegistry, installModule } from "@sbc/kernel";
import { db, modules, tenants, users } from "@sbc/database";
import { eq } from "drizzle-orm";
import { hashPassword } from "@sbc/auth";
import type { ModuleManifest } from "@sbc/sdk";

export const SYSTEM_TENANT_ID = "00000000-0000-0000-0000-000000000001";
const CORE_MODULES: ModuleManifest[] = [baseManifest, iamManifest];

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
  const existing = await db.query.users.findFirst({
    where: eq(users.email, ADMIN_EMAIL),
  });
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
    return;
  }

  await installModule(manifest, {});
  console.warn(`[sbc] module "${manifest.name}" installed`);
}

export async function bootstrapApp(): Promise<void> {
  if (bootstrapped) return;
  bootstrapped = true;

  try { await ensureSystemTenant(); } catch (err) { console.error("[sbc] tenant error:", err); }
  for (const manifest of CORE_MODULES) {
    try { await ensureInstalled(manifest); } catch (err) { console.error(`[sbc] module "${manifest.name}" error:`, err); }
  }
  try { await ensureSuperAdmin(); } catch (err) { console.error("[sbc] admin error:", err); }
}
