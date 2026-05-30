import Link from "next/link";
import { eq, gte, sql } from "drizzle-orm";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { MODULE_WIDGET_LOADERS } from "@/lib/widget-registry";
import { BUILTIN_WIDGETS, type BuiltinWidgetConfig, type WidgetStatData } from "@/lib/builtin-widgets";
import { WidgetArea } from "./_components/widget-area";
import { BuiltinWidgetArea } from "./_components/builtin-widget-area";
import { getSessionUser } from "@/lib/session";
import { getWidgetLayout } from "@/actions/widget-layout";
import { getBuiltinWidgetConfig } from "@/actions/builtin-widget-settings";
import { HiMiniPuzzlePiece } from "react-icons/hi2";
import { db, modules, auditLogs, users as usersTable, events } from "@sbc/database";
import { SYSTEM_TENANT_ID } from "@/lib/bootstrap";

export default async function DashboardPage() {
  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  const user     = await getSessionUser();
  const tenantId = user?.tenantId ?? SYSTEM_TENANT_ID;

  const [
    installedRowsRaw,
    userCount,
    auditToday,
    pendingEvents,
    savedLayout,
    builtinConfig,
  ] = await Promise.all([
    db.select({ name: modules.name, title: modules.title, version: modules.installedVersion })
      .from(modules)
      .where(eq(modules.state, "installed")),
    db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(eq(usersTable.isActive, true)),
    db.select({ count: sql<number>`count(*)::int` }).from(auditLogs).where(gte(auditLogs.createdAt, dayStart)),
    db.select({ count: sql<number>`count(*)::int` }).from(events).where(sql`processed_at IS NULL`),
    user ? getWidgetLayout(user.id) : Promise.resolve(null),
    user ? getBuiltinWidgetConfig(user.id) : Promise.resolve(null),
  ]);

  const seen = new Set<string>();
  const installedRows = installedRowsRaw.filter((r) => {
    if (seen.has(r.name)) return false;
    seen.add(r.name);
    return true;
  });

  const installedCount  = installedRows.length;
  const activeUserCount = userCount[0]?.count    ?? 0;
  const auditCount      = auditToday[0]?.count   ?? 0;
  const eventCount      = pendingEvents[0]?.count ?? 0;

  // ── Module widgets ─────────────────────────────────────────────────────────
  const SYSTEM_MODULE_NAMES = new Set(["base", "iam"]);
  const appModules = installedRows.filter((row) => !SYSTEM_MODULE_NAMES.has(row.name));

  const widgetResults = await Promise.all(
    appModules
      .filter((m) => MODULE_WIDGET_LOADERS[m.name])
      .map(async (m) => {
        try {
          const data = await MODULE_WIDGET_LOADERS[m.name]!(SYSTEM_TENANT_ID);
          return { name: m.name, data, error: null };
        } catch {
          return { name: m.name, data: null, error: true };
        }
      }),
  );
  const moduleWidgets = widgetResults.filter((w) => w.data !== null);

  // ── Builtin widget server data ─────────────────────────────────────────────
  const initialBuiltinConfig: BuiltinWidgetConfig[] = builtinConfig ?? [];

  const enabledBuiltinIds = new Set(
    initialBuiltinConfig.length > 0
      ? initialBuiltinConfig.filter((c) => c.enabled).map((c) => c.id)
      : BUILTIN_WIDGETS.map((w) => w.id),
  );

  const builtinServerData: Record<string, WidgetStatData> = {};

  if (enabledBuiltinIds.has("stat-modules")) {
    builtinServerData["stat-modules"] = { value: installedCount,  sub: "installed modules", icon: "cube"   };
  }
  if (enabledBuiltinIds.has("stat-users")) {
    builtinServerData["stat-users"]   = { value: activeUserCount, sub: "active users",       icon: "users"  };
  }
  if (enabledBuiltinIds.has("stat-events")) {
    builtinServerData["stat-events"]  = { value: eventCount,      sub: "pending events",     icon: "bolt"   };
  }
  if (enabledBuiltinIds.has("stat-audit")) {
    builtinServerData["stat-audit"]   = { value: auditCount,      sub: "audit entries today",icon: "shield" };
  }

  const hasBuiltinWidgets = enabledBuiltinIds.size > 0;

  return (
    <div className="space-y-8">
      <DashboardPageHeader title="Dashboard" />

      {/* ── Builtin wigggle-ui widgets ───────────────────────────── */}
      {hasBuiltinWidgets && (
        <section className="space-y-4">
          <SectionHeader label="My Widgets" />
          <BuiltinWidgetArea
            initialConfig={initialBuiltinConfig}
            serverData={builtinServerData}
            userId={user?.id ?? ""}
            tenantId={tenantId}
          />
        </section>
      )}

      {moduleWidgets.length > 0 ? (
        <section className="space-y-4">
          <SectionHeader label="Module Widgets" />
          <WidgetArea
            widgets={moduleWidgets.map((w) => ({ data: w.data! }))}
            initialLayout={savedLayout ?? []}
            userId={user?.id ?? ""}
            tenantId={tenantId}
          />
        </section>
      ) : appModules.length === 0 ? (
        <section className="space-y-4">
          <SectionHeader label="Module Widgets" />
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-muted/10 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
              <HiMiniPuzzlePiece className="h-6 w-6" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">No module widgets</p>
              <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
                Install modules from the Marketplace to see live data widgets here.
              </p>
            </div>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              Browse Marketplace
            </Link>
          </div>
        </section>
      ) : null}

    </div>
  );
}


function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </h2>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
