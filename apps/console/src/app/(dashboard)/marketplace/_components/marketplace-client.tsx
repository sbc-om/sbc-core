"use client";

import { useMemo, useState } from "react";
import { HiMiniMagnifyingGlass, HiMiniAdjustmentsHorizontal } from "react-icons/hi2";
import { ModuleCard } from "./module-card";
import { CATEGORIES } from "../_data/catalog";
import type { CatalogModule, CatalogStatus } from "../_data/catalog";

interface MarketplaceEntry {
  module:           CatalogModule;
  status:           CatalogStatus;
  installedVersion: string | null;
}

interface Props {
  entries: MarketplaceEntry[];
  stats: {
    installed:   number;
    available:   number;
    comingSoon:  number;
  };
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

  // Group for display
  const installed   = filtered.filter((e) => e.status === "installed" || e.status === "core");
  const available   = filtered.filter((e) => e.status === "available" || e.status === "error" || e.status === "in_progress");
  const comingSoon  = filtered.filter((e) => e.status === "coming_soon");

  const isEmpty = filtered.length === 0;

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Installed",    value: stats.installed,  color: "text-green-600" },
          { label: "Available",    value: stats.available,  color: "text-blue-600" },
          { label: "Coming Soon",  value: stats.comingSoon, color: "text-muted-foreground" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-background p-4 text-center">
            <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + category filter */}
      <div className="rounded-lg border border-border bg-background p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <HiMiniMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search modules…"
              className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </div>

          {/* Showing count */}
          <span className="shrink-0 text-xs text-muted-foreground">
            <HiMiniAdjustmentsHorizontal className="mr-1 inline h-3.5 w-3.5" />
            {filtered.length} of {entries.length} modules
          </span>
        </div>

        {/* Category tabs */}
        <div className="mt-3 flex flex-wrap gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === cat.key
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {cat.label}
              {cat.key === "installed" && stats.installed > 0 && (
                <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  activeCategory === cat.key ? "bg-white/20 text-white" : "bg-green-100 text-green-700"
                }`}>
                  {stats.installed}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-20 text-center">
          <p className="text-2xl">🔍</p>
          <p className="text-sm font-medium text-foreground">No modules found</p>
          <p className="text-xs text-muted-foreground">Try a different search term or category.</p>
        </div>
      )}

      {/* Installed */}
      {installed.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Installed</h2>
            <span className="rounded border border-green-200 bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
              {installed.length}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {installed.map((e) => (
              <ModuleCard key={e.module.name} module={e.module} status={e.status} installedVersion={e.installedVersion} />
            ))}
          </div>
        </section>
      )}

      {/* Available */}
      {available.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Available</h2>
            <span className="rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
              {available.length}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {available.map((e) => (
              <ModuleCard key={e.module.name} module={e.module} status={e.status} installedVersion={e.installedVersion} />
            ))}
          </div>
        </section>
      )}

      {/* Coming Soon */}
      {comingSoon.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Coming Soon</h2>
            <span className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {comingSoon.length}
            </span>
          </div>
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
