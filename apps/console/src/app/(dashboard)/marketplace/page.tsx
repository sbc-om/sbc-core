import { db, modules as modulesTable } from "@sbc/database";
import { MarketplaceClient } from "./_components/marketplace-client";
import { SyncMenusButton } from "@/components/sync-menus-button";
import { CATALOG } from "./_data/catalog";
import { listExternalModuleManifests } from "@/lib/external-modules";
import { compareModuleVersions } from "@/lib/module-version";
import type { CatalogStatus, CatalogModule } from "./_data/catalog";
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
  const [dbRows, externalManifests] = await Promise.all([
    db.select({
      name:             modulesTable.name,
      state:            modulesTable.state,
      installedVersion: modulesTable.installedVersion,
    }).from(modulesTable),
    listExternalModuleManifests(),
  ]);

  const dbMap = new Map(dbRows.map((r) => [r.name, r]));

  // ── Build external entries (uploaded via ZIP) ──────────────────────────────
  // An external module overrides a catalog entry when the catalog entry is
  // not yet installable (coming_soon). This lets community ZIPs unlock modules
  // that are listed in the catalog but not yet released by SBC.
  const externalOverrideNames = new Set(
    externalManifests
      .filter((m) => {
        const cat = CATALOG.find((c) => c.name === m.name);
        return !cat || !cat.installable; // override only non-installable (coming_soon) entries
      })
      .map((m) => m.name),
  );

  // ── Build catalog entries ──────────────────────────────────────────────────
  const catalogEntries = CATALOG
    .filter((mod) => !externalOverrideNames.has(mod.name)) // skip entries replaced by external
    .map((mod) => {
      const row    = dbMap.get(mod.name);
      const status = resolveStatus(mod, (row?.state ?? null) as ModuleState | null);
      return {
        module:           mod,
        status,
        installedVersion: row?.installedVersion ?? null,
        hasUpgrade:       !!row?.installedVersion && compareModuleVersions(mod.version, row.installedVersion) > 0,
        isExternal:       false,
      };
    });

  const externalEntries = externalManifests
    .filter((m) => {
      const cat = CATALOG.find((c) => c.name === m.name);
      return !cat || !cat.installable; // include external if not in catalog OR catalog is coming_soon
    })
    .map((m) => {
      const row    = dbMap.get(m.name);
      const status = resolveStatus({ name: m.name, installable: m.installable !== false }, (row?.state ?? null) as ModuleState | null);

      const mod: CatalogModule = {
        name:          m.name,
        title:         m.title,
        description:   m.description ?? "",
        category:      (m.category as string) ?? "operations",
        categoryLabel: (m.category as string) ?? "Operations",
        icon:          "puzzle",
        version:       m.version,
        author:        m.author ?? "Community",
        pricing:       "free",
        depends:       m.depends ?? [],
        tags:          ["external", m.category as string].filter(Boolean),
        featured:      false,
        installable:   m.installable !== false,
      };

      return {
        module:           mod,
        status,
        installedVersion: row?.installedVersion ?? null,
        hasUpgrade:       !!row?.installedVersion && compareModuleVersions(mod.version, row.installedVersion) > 0,
        isExternal:       true,
      };
    });

  const entries = [...catalogEntries, ...externalEntries];

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
