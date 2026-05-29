"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, buttonVariants, cn } from "@sbc/ui";
import { HiMiniChevronLeft, HiMiniChevronRight, HiMiniSquares2X2, HiMiniSparkles } from "react-icons/hi2";
import { BUILTIN_WIDGETS, type BuiltinWidgetConfig } from "@/lib/builtin-widgets";
import { saveBuiltinWidgetConfig } from "@/actions/builtin-widget-settings";
import { useToast } from "@/components/system-feedback";

interface Props {
  userId:        string;
  tenantId:      string;
  initialConfig: BuiltinWidgetConfig[];
  activeCategory: string;
  currentPage: number;
  moduleScope: string;
  modulePage: number;
  expandedModule: string | null;
}

const PAGE_SIZE = 4;

function buildHref(params: {
  activeCategory: string;
  page: number;
  moduleScope: string;
  modulePage: number;
  expandedModule: string | null;
}) {
  const searchParams = new URLSearchParams();

  if (params.moduleScope !== "all") searchParams.set("moduleScope", params.moduleScope);
  if (params.modulePage > 1) searchParams.set("modulePage", String(params.modulePage));
  if (params.expandedModule) searchParams.set("moduleSection", params.expandedModule);
  if (params.activeCategory !== "all") searchParams.set("widgetCategory", params.activeCategory);
  if (params.page > 1) searchParams.set("widgetPage", String(params.page));

  const query = searchParams.toString();
  return query.length > 0 ? `/settings?${query}` : "/settings";
}

export function WidgetSettings({ userId, tenantId, initialConfig, activeCategory, currentPage, moduleScope, modulePage, expandedModule }: Props) {
  const toast = useToast();

  const buildState = (): BuiltinWidgetConfig[] => {
    const allIds  = BUILTIN_WIDGETS.map((w) => w.id);
    const saved   = initialConfig.filter((c) => allIds.includes(c.id));
    const inSaved = new Set(saved.map((c) => c.id));
    const newOnes = allIds
      .filter((id) => !inSaved.has(id))
      .map((id, i) => ({ id, enabled: true, order: saved.length + i }));
    return [...saved, ...newOnes].sort((a, b) => a.order - b.order);
  };

  const [config, setConfig] = useState<BuiltinWidgetConfig[]>(buildState);
  const [saving, setSaving] = useState(false);

  async function toggle(id: string) {
    const next = config.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c));
    setConfig(next);
    setSaving(true);
    const result = await saveBuiltinWidgetConfig(userId, tenantId, next);
    setSaving(false);
    if (result.error) toast.error("Failed to save", result.error);
  }

  const enabledSet = new Set(config.filter((c) => c.enabled).map((c) => c.id));
  const orderLookup = new Map(config.map((item) => [item.id, item.order]));
  const categories = ["all", ...Array.from(new Set(BUILTIN_WIDGETS.map((widget) => widget.category)))];
  const orderedWidgets = [...BUILTIN_WIDGETS].sort(
    (left, right) => (orderLookup.get(left.id) ?? 0) - (orderLookup.get(right.id) ?? 0),
  );
  const filteredWidgets = orderedWidgets.filter((widget) => (
    activeCategory === "all" ? true : widget.category === activeCategory
  ));
  const totalPages = Math.max(1, Math.ceil(filteredWidgets.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const visibleWidgets = filteredWidgets.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-border/70 bg-muted/20 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Widget library</p>
          <p className="text-xs text-muted-foreground">Each widget has its own action button and the list is paginated for faster control.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((category) => {
            const count = category === "all"
              ? BUILTIN_WIDGETS.length
              : BUILTIN_WIDGETS.filter((widget) => widget.category === category).length;

            return (
              <Link
                key={category}
                href={buildHref({
                  activeCategory: category,
                  page: 1,
                  moduleScope,
                  modulePage,
                  expandedModule,
                })}
                className={buttonVariants({
                  size: "sm",
                  variant: activeCategory === category ? "default" : "outline",
                })}
              >
                {category === "all" ? "All widgets" : category}
                <span className="rounded-full bg-background/80 px-2 py-0.5 text-[11px] text-foreground">
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {visibleWidgets.map((widget) => {
          const enabled = enabledSet.has(widget.id);

          return (
            <article
              key={widget.id}
              className={cn(
                "rounded-lg border border-border/70 bg-background p-5 shadow-sm transition-all",
                enabled && "border-foreground/15 shadow-md",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <HiMiniSquares2X2 className="h-3.5 w-3.5" />
                    {widget.category}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">{widget.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{widget.description}</p>
                  </div>
                </div>
                <span className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                  enabled
                    ? "bg-foreground text-background"
                    : "border border-border bg-background text-muted-foreground",
                )}>
                  {enabled ? "Enabled" : "Disabled"}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full border border-border px-2.5 py-1">Size: {widget.size.toUpperCase()}</span>
                <span className="rounded-full border border-border px-2.5 py-1">
                  {widget.needsServerData ? "Server-backed" : "Client-only"}
                </span>
                {enabled && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-foreground">
                    <HiMiniSparkles className="h-3.5 w-3.5" />
                    Active on dashboard
                  </span>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  {saving ? "Saving changes..." : "Changes are saved for your account immediately."}
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant={enabled ? "secondary" : "default"}
                  onClick={() => toggle(widget.id)}
                  disabled={saving}
                >
                  {enabled ? "Disable widget" : "Enable widget"}
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Page {safePage} of {totalPages} · {filteredWidgets.length} widget{filteredWidgets.length === 1 ? "" : "s"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={buildHref({
              activeCategory,
              page: Math.max(1, safePage - 1),
              moduleScope,
              modulePage,
              expandedModule,
            })}
            aria-disabled={safePage === 1}
            className={cn(
              buttonVariants({ size: "sm", variant: "outline" }),
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
                activeCategory,
                page: index + 1,
                moduleScope,
                modulePage,
                expandedModule,
              })}
              className={buttonVariants({
                size: "sm",
                variant: index + 1 === safePage ? "default" : "outline",
              })}
            >
              {index + 1}
            </Link>
          ))}
          <Link
            href={buildHref({
              activeCategory,
              page: Math.min(totalPages, safePage + 1),
              moduleScope,
              modulePage,
              expandedModule,
            })}
            aria-disabled={safePage >= totalPages}
            className={cn(
              buttonVariants({ size: "sm", variant: "outline" }),
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
