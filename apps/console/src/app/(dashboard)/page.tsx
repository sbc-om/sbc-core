import Link from "next/link";
import { eq, gte, sql } from "drizzle-orm";
import {
  HiMiniBolt,
  HiMiniCheckCircle,
  HiMiniCpuChip,
  HiMiniCube,
  HiMiniPuzzlePiece,
  HiMiniShieldCheck,
  HiMiniUsers,
} from "react-icons/hi2";
import type { ComponentType } from "react";
import { db, modules, auditLogs, users as usersTable, events } from "@sbc/database";
import { CATALOG } from "./marketplace/_data/catalog";

// ── icon map (mirrors marketplace catalog) ────────────────────────────────────
import {
  HiMiniBanknotes,
  HiMiniBriefcase,
  HiMiniCog6Tooth,
  HiMiniFolderOpen,
  HiMiniIdentification,
  HiMiniLockClosed,
  HiMiniPhone,
  HiMiniSparkles,
  HiMiniSquaresPlus,
  HiMiniUserGroup,
} from "react-icons/hi2";

const MODULE_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  cpu:            HiMiniCpuChip,
  lock:           HiMiniLockClosed,
  folder:         HiMiniFolderOpen,
  identification: HiMiniIdentification,
  users:          HiMiniUserGroup,
  briefcase:      HiMiniBriefcase,
  banknotes:      HiMiniBanknotes,
  shield:         HiMiniShieldCheck,
  workflow:       HiMiniSquaresPlus,
  phone:          HiMiniPhone,
  sparkles:       HiMiniSparkles,
  cog:            HiMiniCog6Tooth,
};

// ── page ──────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  const [installedRowsRaw, userCount, auditToday, pendingEvents] = await Promise.all([
    db.select({ name: modules.name, title: modules.title, version: modules.installedVersion })
      .from(modules)
      .where(eq(modules.state, "installed")),
    db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(eq(usersTable.isActive, true)),
    db.select({ count: sql<number>`count(*)::int` }).from(auditLogs).where(gte(auditLogs.createdAt, dayStart)),
    db.select({ count: sql<number>`count(*)::int` }).from(events).where(sql`processed_at IS NULL`),
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

  const coreModules = enriched.filter((r) => r.catalog.category === "system");
  const appModules  = enriched.filter((r) => r.catalog.category !== "system");

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

      {/* ── App modules (user-facing) ────────────────────────────── */}
      {appModules.length > 0 && (
        <section className="space-y-4">
          <SectionHeader label="Apps" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {appModules.map((m) => {
              const cat = m.catalog!;
              const Icon = MODULE_ICONS[cat.icon] ?? HiMiniCube;
              return (
                <ModuleQuickCard
                  key={m.name}
                  title={cat.title}
                  description={cat.description}
                  category={cat.categoryLabel}
                  version={m.version ?? cat.version}
                  Icon={Icon}
                  href="#"
                />
              );
            })}
          </div>
        </section>
      )}

      {/* ── Widget area ──────────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader label="Widgets" />

        {appModules.length === 0 ? (
          /* Empty state — no user-facing modules installed */
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-muted/10 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
              <HiMiniPuzzlePiece className="h-6 w-6" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">No widgets yet</p>
              <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
                Installed modules can register dashboard widgets here. Each module decides what data to surface.
              </p>
            </div>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          /* Widget placeholder per installed app module */
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {appModules.map((m) => {
              const cat  = m.catalog!;
              const Icon = MODULE_ICONS[cat.icon] ?? HiMiniCube;
              return (
                <div key={m.name} className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/10 p-6 text-center">
                  <Icon className="h-6 w-6 text-muted-foreground/50" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-muted-foreground">{cat.title}</p>
                    <p className="text-[11px] text-muted-foreground/60">
                      Widget not registered yet
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Core infrastructure ──────────────────────────────────── */}
      {coreModules.length > 0 && (
        <section className="space-y-3">
          <SectionHeader label="Platform" />
          <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-background">
            {coreModules.map((m) => {
              const cat  = m.catalog!;
              const Icon = MODULE_ICONS[cat.icon] ?? HiMiniCube;
              return (
                <div key={m.name} className="flex items-center gap-4 px-4 py-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{cat.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{cat.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground/60">
                      v{m.version ?? cat.version}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      <HiMiniCheckCircle className="h-3 w-3" />
                      Active
                    </span>
                  </div>
                </div>
              );
            })}
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

function ModuleQuickCard({
  title,
  description,
  category,
  version,
  Icon,
  href,
}: {
  title:       string;
  description: string;
  category:    string;
  version:     string;
  Icon:        ComponentType<{ className?: string }>;
  href:        string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-lg border border-border bg-background p-4 transition-all hover:border-slate-300 hover:shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground transition-colors group-hover:border-slate-300">
          <Icon className="h-4 w-4" />
        </span>
        <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
          Installed
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
          {category}
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {description}
        </p>
      </div>
      <p className="font-mono text-[10px] text-muted-foreground/50">v{version}</p>
    </Link>
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
