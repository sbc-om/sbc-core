"use client";

import { useMemo, useState } from "react";
import type { ComponentType } from "react";
import {
  HiMiniBanknotes,
  HiMiniBriefcase,
  HiMiniCheckCircle,
  HiMiniCog6Tooth,
  HiMiniCpuChip,
  HiMiniMagnifyingGlass,
  HiMiniPhone,
  HiMiniSparkles,
  HiMiniSquares2X2,
  HiMiniUserGroup,
  HiMiniXMark,
} from "react-icons/hi2";
import { ModuleCard } from "./module-card";
import { CATEGORIES } from "../_data/catalog";
import type { CatalogModule, CatalogStatus } from "../_data/catalog";

// ── Category icon map ─────────────────────────────────────────────────────────
const CAT_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  grid:       HiMiniSquares2X2,
  check:      HiMiniCheckCircle,
  users:      HiMiniUserGroup,
  briefcase:  HiMiniBriefcase,
  banknotes:  HiMiniBanknotes,
  cog:        HiMiniCog6Tooth,
  phone:      HiMiniPhone,
  sparkles:   HiMiniSparkles,
  cpu:        HiMiniCpuChip,
};

interface MarketplaceEntry {
  module:           CatalogModule;
  status:           CatalogStatus;
  installedVersion: string | null;
}

interface Props {
  entries: MarketplaceEntry[];
  stats:   { installed: number; available: number; comingSoon: number };
}

export function MarketplaceClient({ entries, stats }: Props) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery]                   = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return entries.filter((e) => {
      const matchesCategory =
        activeCategory === "all" ||
        (activeCategory === "installed" && (e.status === "installed" || e.status === "core")) ||
        e.module.category === activeCategory;

      const matchesQuery =
        !q ||
        e.module.title.toLowerCase().includes(q) ||
        e.module.description.toLowerCase().includes(q) ||
        e.module.tags.some((t) => t.includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [entries, activeCategory, query]);

  const installed  = filtered.filter((e) => e.status === "installed" || e.status === "core");
  const available  = filtered.filter((e) => e.status === "available" || e.status === "error" || e.status === "in_progress");
  const comingSoon = filtered.filter((e) => e.status === "coming_soon");
  const isEmpty    = filtered.length === 0;

  return (
    <div className="space-y-8">

      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className="space-y-4">

        {/* Search */}
        <div className="relative">
          <HiMiniMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, category, or tag…"
            className="w-full rounded-md border border-input bg-background py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <HiMiniXMark className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {CATEGORIES.map((cat) => {
            const CatIcon = CAT_ICONS[cat.icon] ?? HiMiniSquares2X2;
            const isActive = activeCategory === cat.key;
            const count = cat.key === "installed" ? stats.installed : null;

            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={[
                  "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted-foreground hover:border-slate-300 hover:text-foreground",
                ].join(" ")}
              >
                <CatIcon className="h-3.5 w-3.5" />
                {cat.label}
                {count !== null && count > 0 && (
                  <span className={[
                    "ml-0.5 rounded border px-1.5 py-0 text-[10px] font-semibold tabular-nums",
                    isActive
                      ? "border-white/30 bg-white/20 text-white"
                      : "border-border bg-muted text-foreground",
                  ].join(" ")}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Result summary */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {stats.installed > 0 && <><span className="font-medium text-foreground">{stats.installed}</span> installed · </>}
            {stats.available > 0  && <><span className="font-medium text-foreground">{stats.available}</span> available · </>}
            <span className="font-medium">{stats.comingSoon}</span> coming soon
          </span>
          {query && (
            <span>{filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;</span>
          )}
        </div>
      </div>

      {/* ── Empty state ──────────────────────────────────────────────── */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-24 text-center">
          <HiMiniMagnifyingGlass className="h-8 w-8 text-muted-foreground/30" />
          <div>
            <p className="text-sm font-medium text-foreground">No modules found</p>
            <p className="mt-1 text-xs text-muted-foreground">Try a different search term or category.</p>
          </div>
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-xs font-medium text-primary hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* ── Installed ────────────────────────────────────────────────── */}
      {installed.length > 0 && (
        <section className="space-y-4">
          <SectionHeader
            label="Installed"
            count={installed.length}
            countClass="border-border bg-muted text-foreground"
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {installed.map((e) => (
              <ModuleCard key={e.module.name} module={e.module} status={e.status} installedVersion={e.installedVersion} />
            ))}
          </div>
        </section>
      )}

      {/* ── Available ────────────────────────────────────────────────── */}
      {available.length > 0 && (
        <section className="space-y-4">
          <SectionHeader
            label="Available"
            count={available.length}
            countClass="border-border bg-muted text-foreground"
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {available.map((e) => (
              <ModuleCard key={e.module.name} module={e.module} status={e.status} installedVersion={e.installedVersion} />
            ))}
          </div>
        </section>
      )}

      {/* ── Coming Soon ───────────────────────────────────────────────── */}
      {comingSoon.length > 0 && (
        <section className="space-y-4">
          <SectionHeader
            label="Coming Soon"
            count={comingSoon.length}
            countClass="border-border bg-muted text-muted-foreground"
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {comingSoon.map((e) => (
              <ModuleCard key={e.module.name} module={e.module} status={e.status} installedVersion={e.installedVersion} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({
  label,
  count,
  countClass,
}: {
  label:       string;
  count:       number;
  countClass:  string;
}) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </h2>
      <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold tabular-nums ${countClass}`}>
        {count}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
