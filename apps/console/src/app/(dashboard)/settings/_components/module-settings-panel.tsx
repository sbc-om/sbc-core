import Link from "next/link";
import { cn } from "@sbc/ui";
import { HiMiniChevronLeft, HiMiniChevronRight, HiMiniCog6Tooth, HiMiniAdjustmentsHorizontal } from "react-icons/hi2";

interface SettingRow {
  key: string;
  value: unknown;
  scope: string;
  module: string | null;
}

interface Props {
  rows: SettingRow[];
  scopeFilter: string;
  currentPage: number;
  expandedModule: string | null;
  basePath: string;
}

const PAGE_SIZE = 3;
const navButtonClass = "inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground";
const navButtonActiveClass = "inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90";

function formatLabel(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatValue(value: unknown) {
  const serialized = JSON.stringify(value, null, 2) ?? "null";
  return serialized.length > 140 ? `${serialized.slice(0, 137)}...` : serialized;
}

function buildHref(params: {
  basePath: string;
  scopeFilter: string;
  page: number;
  expandedModule: string | null;
}) {
  const searchParams = new URLSearchParams();

  if (params.scopeFilter !== "all") searchParams.set("moduleScope", params.scopeFilter);
  if (params.page > 1) searchParams.set("modulePage", String(params.page));
  if (params.expandedModule) searchParams.set("moduleSection", params.expandedModule);

  const query = searchParams.toString();
  return query.length > 0 ? `${params.basePath}?${query}` : params.basePath;
}

export function ModuleSettingsPanel({ rows, scopeFilter, currentPage, expandedModule, basePath }: Props) {
  const scopes = ["all", ...Array.from(new Set(rows.map((row) => row.scope)))];
  const groupedRows = Array.from(
    rows.reduce((acc, row) => {
      const moduleKey = row.module ?? "core";
      const current = acc.get(moduleKey) ?? [];
      current.push(row);
      acc.set(moduleKey, current);
      return acc;
    }, new Map<string, SettingRow[]>()),
  )
    .map(([moduleName, moduleRows]) => ({
      moduleName,
      label: formatLabel(moduleName),
      rows: moduleRows,
      scopes: Array.from(new Set(moduleRows.map((row) => row.scope))),
    }))
    .sort((left, right) => left.label.localeCompare(right.label));

  const filteredGroups = groupedRows.filter((group) => (
    scopeFilter === "all" ? true : group.rows.some((row) => row.scope === scopeFilter)
  ));

  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const visibleGroups = filteredGroups.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-border/70 bg-muted/20 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Registered configuration sections</p>
          <p className="text-xs text-muted-foreground">
            Browse module-owned settings by scope, then open each section independently.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {scopes.map((scope) => (
            <Link
              key={scope}
              href={buildHref({
                basePath,
                scopeFilter: scope,
                page: 1,
                expandedModule: null,
              })}
              className={scopeFilter === scope ? navButtonActiveClass : navButtonClass}
            >
              {scope === "all" ? "All scopes" : formatLabel(scope)}
            </Link>
          ))}
        </div>
      </div>

      {filteredGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-background px-6 py-14 text-center">
          <HiMiniCog6Tooth className="h-9 w-9 text-muted-foreground/50" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">No matching settings</p>
            <p className="text-xs text-muted-foreground">Try switching the scope filter to inspect other registered sections.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-3">
          {visibleGroups.map((group) => {
            const isExpanded = expandedModule === group.moduleName;
            const visibleRows = scopeFilter === "all"
              ? group.rows
              : group.rows.filter((row) => row.scope === scopeFilter);

            return (
              <article
                key={group.moduleName}
                className={cn(
                  "overflow-hidden rounded-lg border border-border/70 bg-background shadow-sm transition-all",
                  isExpanded && "border-foreground/20 shadow-md",
                )}
              >
                <div className="border-b border-border/70 bg-gradient-to-br from-background via-background to-muted/30 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        <HiMiniAdjustmentsHorizontal className="h-3.5 w-3.5" />
                        {group.label}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-foreground">
                          {visibleRows.length} setting{visibleRows.length === 1 ? "" : "s"}
                        </span>
                        {group.scopes.map((scope) => (
                          <span key={scope} className="rounded-full border border-border px-2.5 py-1">
                            {formatLabel(scope)}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Link
                      href={buildHref({
                        basePath,
                        scopeFilter,
                        page: safePage,
                        expandedModule: isExpanded ? null : group.moduleName,
                      })}
                      className={isExpanded ? "inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-secondary px-3 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80" : navButtonClass}
                    >
                      {isExpanded ? "Collapse" : "Open section"}
                    </Link>
                  </div>
                </div>

                <div className="space-y-3 p-5">
                  {visibleRows.slice(0, isExpanded ? visibleRows.length : 3).map((row) => (
                    <div key={row.key} className="rounded-md border border-border/70 bg-muted/20 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-mono text-xs font-semibold text-foreground">{row.key}</p>
                          <p className="mt-2 whitespace-pre-wrap break-all rounded-md bg-background px-3 py-2 font-mono text-[11px] text-muted-foreground">
                            {formatValue(row.value)}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                          {formatLabel(row.scope)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {!isExpanded && visibleRows.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      {visibleRows.length - 3} more item{visibleRows.length - 3 === 1 ? "" : "s"} in this section.
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Page {safePage} of {totalPages} · {filteredGroups.length} section{filteredGroups.length === 1 ? "" : "s"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={buildHref({
              basePath,
              scopeFilter,
              page: Math.max(1, safePage - 1),
              expandedModule,
            })}
            aria-disabled={safePage === 1}
            className={cn(
              navButtonClass,
              safePage === 1 && "pointer-events-none opacity-50",
            )}
          >
            <HiMiniChevronLeft className="h-4 w-4" />
            Previous
          </Link>
          {Array.from({ length: totalPages }, (_, index) => (
            <Link
              key={index}
              href={buildHref({
                basePath,
                scopeFilter,
                page: index + 1,
                expandedModule,
              })}
              className={index + 1 === safePage ? navButtonActiveClass : navButtonClass}
            >
              {index + 1}
            </Link>
          ))}
          <Link
            href={buildHref({
              basePath,
              scopeFilter,
              page: Math.min(totalPages, safePage + 1),
              expandedModule,
            })}
            aria-disabled={safePage >= totalPages}
            className={cn(
              navButtonClass,
              safePage >= totalPages && "pointer-events-none opacity-50",
            )}
          >
            Next
            <HiMiniChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}