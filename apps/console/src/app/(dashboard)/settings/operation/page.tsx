import { db, settings } from "@sbc/database";
import { asc } from "drizzle-orm";
import { ModuleSettingsPanel } from "../_components/module-settings-panel";
import { SettingsSectionShell } from "../_components/settings-section-shell";

interface SearchParams {
  moduleScope?: string | string[];
  modulePage?: string | string[];
  moduleSection?: string | string[];
}

function getParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getPage(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function OperationSettingsPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = (await searchParams) ?? {};
  const rows = await db
    .select({ key: settings.key, value: settings.value, scope: settings.scope, module: settings.module })
    .from(settings)
    .orderBy(asc(settings.module), asc(settings.key));

  return (
    <SettingsSectionShell
      title="Operation"
      description="Review module-owned settings in their own page, with filtering and pagination."
    >
      {rows.length === 0 ? (
        <section className="space-y-4 rounded-lg border border-border/70 bg-background p-6 shadow-sm lg:p-8">
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 py-16 text-center">
            <p className="text-sm font-medium text-foreground">No settings registered</p>
            <p className="text-xs text-muted-foreground">Settings are registered when modules are installed.</p>
          </div>
        </section>
      ) : (
        <ModuleSettingsPanel
          rows={rows}
          scopeFilter={getParam(params.moduleScope) ?? "all"}
          currentPage={getPage(getParam(params.modulePage))}
          expandedModule={getParam(params.moduleSection) ?? null}
          basePath="/settings/operation"
        />
      )}
    </SettingsSectionShell>
  );
}
