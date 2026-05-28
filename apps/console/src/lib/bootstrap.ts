import { manifest as baseManifest } from "@sbc/module-base";
import { moduleRegistry, installModule } from "@sbc/kernel";
import { db, modules } from "@sbc/database";
import { eq } from "drizzle-orm";

let bootstrapped = false;

export async function bootstrapApp(): Promise<void> {
  if (bootstrapped) return;
  bootstrapped = true;

  try {
    // Register base module into the in-memory registry
    if (!moduleRegistry.has(baseManifest.name)) {
      moduleRegistry.register(baseManifest, "modules/base", "discovered");
    }

    // Check if already installed in DB
    const existing = await db.query.modules.findFirst({
      where: eq(modules.name, baseManifest.name),
    });

    if (existing?.state === "installed") {
      moduleRegistry.setState(baseManifest.name, "installed");
      return;
    }

    // Install base module (registers menus + permissions in DB)
    await installModule(baseManifest, {});
    console.warn("[sbc] base module installed");
  } catch (err) {
    console.error("[sbc] bootstrap error:", err);
  }
}
