import { db, settings } from "@sbc/database";
import { asc } from "drizzle-orm";
import { HiMiniCog6Tooth, HiMiniSquares2X2, HiMiniRectangleGroup, HiMiniBuildingOffice2, HiMiniShieldCheck } from "react-icons/hi2";
import { getSessionUser } from "@/lib/session";
import { getBuiltinWidgetConfig } from "@/actions/builtin-widget-settings";
import { ModuleSettingsPanel } from "./_components/module-settings-panel";
import { WidgetSettings } from "./_components/widget-settings";
import { SYSTEM_TENANT_ID } from "@/lib/bootstrap";

interface SearchParams {
  moduleScope?: string | string[];
  modulePage?: string | string[];
  moduleSection?: string | string[];
  widgetCategory?: string | string[];
  widgetPage?: string | string[];
}

function getParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getPage(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function SettingsPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = (await searchParams) ?? {};
  const [rows, user] = await Promise.all([
    db
      .select({ key: settings.key, value: settings.value, scope: settings.scope, module: settings.module })
      .from(settings)
      .orderBy(asc(settings.module), asc(settings.key)),
    getSessionUser(),
  ]);

  const tenantId       = user?.tenantId ?? SYSTEM_TENANT_ID;
  const widgetConfig   = user ? (await getBuiltinWidgetConfig(user.id)) ?? [] : [];
  const moduleCount    = new Set(rows.map((row) => row.module ?? "core")).size;
  const scopeCount     = new Set(rows.map((row) => row.scope)).size;
  const moduleScope    = getParam(params.moduleScope) ?? "all";
  const modulePage     = getPage(getParam(params.modulePage));
  const moduleSection  = getParam(params.moduleSection) ?? null;
  const widgetCategory = getParam(params.widgetCategory) ?? "all";
  const widgetPage     = getPage(getParam(params.widgetPage));

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-lg border border-border/70 bg-background shadow-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)] lg:p-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <HiMiniShieldCheck className="h-3.5 w-3.5" />
              Control Center
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">Settings</h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Organize platform, tenant, and personal configuration in focused sections with dedicated controls.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <HiMiniRectangleGroup className="h-4 w-4" />
                Sections
              </div>
              <p className="mt-3 text-3xl font-semibold text-foreground">{moduleCount}</p>
              <p className="mt-1 text-xs text-muted-foreground">Module-owned configuration groups</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <HiMiniCog6Tooth className="h-4 w-4" />
                Settings
              </div>
              <p className="mt-3 text-3xl font-semibold text-foreground">{rows.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">Registered keys available for review</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <HiMiniBuildingOffice2 className="h-4 w-4" />
                Scopes
              </div>
              <p className="mt-3 text-3xl font-semibold text-foreground">{scopeCount}</p>
              <p className="mt-1 text-xs text-muted-foreground">System, tenant, and user visibility layers</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-border/70 bg-background p-6 shadow-sm lg:p-8">
        <div className="flex items-center gap-3">
          <HiMiniCog6Tooth className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Module Settings</h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 py-16 text-center">
            <HiMiniCog6Tooth className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">No settings registered</p>
            <p className="text-xs text-muted-foreground">Settings are registered when modules are installed.</p>
          </div>
        ) : (
          <ModuleSettingsPanel
            rows={rows}
            scopeFilter={moduleScope}
            currentPage={modulePage}
            expandedModule={moduleSection}
            widgetCategory={widgetCategory}
            widgetPage={widgetPage}
          />
        )}
      </section>

      {user && (
        <section className="space-y-4 rounded-lg border border-border/70 bg-background p-6 shadow-sm lg:p-8">
          <div className="flex items-center gap-3">
            <HiMiniSquares2X2 className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Dashboard Widgets</h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <p className="text-xs text-muted-foreground">
            Choose which widgets appear on your dashboard. Changes apply to your account only.
          </p>
          <WidgetSettings
            userId={user.id}
            tenantId={tenantId}
            initialConfig={widgetConfig}
            activeCategory={widgetCategory}
            currentPage={widgetPage}
            moduleScope={moduleScope}
            modulePage={modulePage}
            expandedModule={moduleSection}
          />
        </section>
      )}
    </div>
  );
}
