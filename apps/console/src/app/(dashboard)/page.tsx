import Link from "next/link";
import { eq, gte, sql } from "drizzle-orm";
import { MODULE_WIDGET_LOADERS } from "@/lib/widget-registry";
import { WidgetArea } from "./_components/widget-area";
import { getSessionUser } from "@/lib/session";
import { getWidgetLayout } from "@/actions/widget-layout";
import {
  HiMiniBolt,
  HiMiniCube,
  HiMiniPuzzlePiece,
  HiMiniShieldCheck,
  HiMiniUsers,
} from "react-icons/hi2";
import type { ComponentType } from "react";
import { db, modules, auditLogs, users as usersTable, events } from "@sbc/database";
import { SYSTEM_TENANT_ID } from "@/lib/bootstrap";
import { CATALOG } from "./marketplace/_data/catalog";

// ── page ──────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  const user = await getSessionUser();
  const tenantId = user?.tenantId ?? SYSTEM_TENANT_ID;

  const [installedRowsRaw, userCount, auditToday, pendingEvents, savedLayout] = await Promise.all([
    db.select({ name: modules.name, title: modules.title, version: modules.installedVersion })
      .from(modules)
      .where(eq(modules.state, "installed")),
    db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(eq(usersTable.isActive, true)),
    db.select({ count: sql<number>`count(*)::int` }).from(auditLogs).where(gte(auditLogs.createdAt, dayStart)),
    db.select({ count: sql<number>`count(*)::int` }).from(events).where(sql`processed_at IS NULL`),
    user ? getWidgetLayout(user.id) : Promise.resolve(null),
  ]);

  // Deduplicate by name (the modules table has no unique constraint on name alone)
  const seen = new Set<string>();
  const installedRows = installedRowsRaw.filter((r) => {
    if (seen.has(r.name)) return false;
    seen.add(r.name);
    return true;
  });

  const installedCount  = installedRows.length;
  const activeUserCount = userCount[0]?.count ?? 0;
  const auditCount      = auditToday[0]?.count ?? 0;
  const eventCount      = pendingEvents[0]?.count ?? 0;

  // Enrich with catalog metadata
  const catalogMap = new Map(CATALOG.map((c) => [c.name, c]));

  type EnrichedModule = {
    name:    string;
    title:   string;
    version: string | null;
    catalog: (typeof CATALOG)[number];
  };

  const enriched = installedRows
    .flatMap((row): EnrichedModule[] => {
      const catalog = catalogMap.get(row.name);
      return catalog ? [{ ...row, catalog }] : [];
    });

  const appModules = enriched.filter((r) => r.catalog.category !== "system");

  // Load widget data for all installed app modules that have a widget loader
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
      })
  );
  const widgets = widgetResults.filter((w) => w.data !== null);

  return (
    <div className="space-y-8">

      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={HiMiniCube}        label="Installed Modules" value={installedCount}  sub="active"       />
        <StatCard icon={HiMiniUsers}       label="Active Users"      value={activeUserCount} sub="platform"     />
        <StatCard icon={HiMiniBolt}        label="Pending Events"    value={eventCount}      sub="in queue"     />
        <StatCard icon={HiMiniShieldCheck} label="Audit Entries"     value={auditCount}      sub="today"        />
      </div>


      {/* ── Widget area ──────────────────────────────────────────── */}
      {widgets.length > 0 ? (
        <section className="space-y-4">
          <SectionHeader label="Widgets" />
          <WidgetArea
            widgets={widgets.map((w) => ({ data: w.data! }))}
            initialLayout={savedLayout ?? []}
            userId={user?.id ?? ""}
            tenantId={tenantId}
          />
        </section>
      ) : appModules.length > 0 ? null : (
        <section className="space-y-4">
          <SectionHeader label="Widgets" />
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-muted/10 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
              <HiMiniPuzzlePiece className="h-6 w-6" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">No widgets yet</p>
              <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
                Install modules from the Marketplace to populate this area with live data and shortcuts.
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
      )}

    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon:  ComponentType<{ className?: string }>;
  label: string;
  value: number;
  sub:   string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{sub}</p>
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
