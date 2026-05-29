import { db, modules as modulesTable } from "@sbc/database";
import { MarketplaceClient } from "./_components/marketplace-client";
import { SyncMenusButton } from "@/components/sync-menus-button";
import { CATALOG } from "./_data/catalog";
import type { CatalogStatus } from "./_data/catalog";
import type { ModuleState } from "@sbc/database";

const CORE_MODULES = new Set(["base", "iam"]);

function resolveStatus(
  catalogEntry: { installable: boolean; name: string },
  dbState: ModuleState | null,
): CatalogStatus {
  if (!dbState) {
    if (catalogEntry.installable) return "available";
    return "coming_soon";
  }

  switch (dbState) {
    case "installed":     return CORE_MODULES.has(catalogEntry.name) ? "core" : "installed";
    case "installing":
    case "to_install":
    case "upgrading":
    case "to_upgrade":
    case "uninstalling":
    case "to_uninstall":  return "in_progress";
    case "error":         return "error";
    case "uninstalled":
    case "discovered":    return catalogEntry.installable ? "available" : "coming_soon";
    default:              return "coming_soon";
  }
}

export default async function MarketplacePage() {
  const dbRows = await db.select({
    name:             modulesTable.name,
    state:            modulesTable.state,
    installedVersion: modulesTable.installedVersion,
  }).from(modulesTable);

  const dbMap = new Map(dbRows.map((r) => [r.name, r]));

  const entries = CATALOG.map((mod) => {
    const row    = dbMap.get(mod.name);
    const status = resolveStatus(mod, (row?.state ?? null) as ModuleState | null);
    return {
      module:           mod,
      status,
      installedVersion: row?.installedVersion ?? null,
    };
  });

  const installed  = entries.filter((e) => e.status === "installed" || e.status === "core").length;
  const available  = entries.filter((e) => e.status === "available").length;
  const comingSoon = entries.filter((e) => e.status === "coming_soon").length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="app-page-header flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Marketplace</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Discover, install, and manage modules that extend your platform.
          </p>
        </div>
        <SyncMenusButton />
      </div>

      <MarketplaceClient
        entries={entries}
        stats={{ installed, available, comingSoon }}
      />
    </div>
  );
}
