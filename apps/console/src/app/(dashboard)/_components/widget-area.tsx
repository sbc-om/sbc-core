"use client";

import { useState, useCallback, useId, type ComponentType } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  HiMiniArrowRight,
  HiMiniEyeSlash,
  HiMiniEye,
  HiMiniBars2,
  HiMiniCube,
  HiMiniBanknotes,
  HiMiniBriefcase,
  HiMiniCog6Tooth,
  HiMiniFolderOpen,
  HiMiniIdentification,
  HiMiniLockClosed,
  HiMiniPhone,
  HiMiniShieldCheck,
  HiMiniSparkles,
  HiMiniSquaresPlus,
  HiMiniUserGroup,
  HiMiniCpuChip,
} from "react-icons/hi2";
import { PiCurrencyBtcBold } from "react-icons/pi";
import Link from "next/link";
import { saveWidgetLayout, type WidgetLayoutItem } from "@/actions/widget-layout";
import { useToast } from "@/components/system-feedback";
import type { WidgetData } from "@/lib/widget-registry";
import { formatCompactNumber, formatPercent, formatUsd } from "@/../external-modules/bitcoin_market/src/lib/format";
import { Sparkline } from "@/../external-modules/bitcoin_market/src/components/sparkline";
import { useBitcoinLiveMarket } from "@/../external-modules/bitcoin_market/src/lib/use-live-market";
import type { BitcoinMarketSnapshot } from "@/../external-modules/bitcoin_market/src/lib/types";

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
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
  bitcoin:        PiCurrencyBtcBold,
};

const BADGE_STYLES = {
  default: "border-border bg-muted text-muted-foreground",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300",
  danger:  "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-300",
} as const;

const ACCENT_STYLES = {
  default: {
    panel: "bg-muted/20",
    stroke: "#94a3b8",
    fill: "rgba(148, 163, 184, 0.12)",
  },
  success: {
    panel: "bg-emerald-50/70 dark:bg-emerald-500/10",
    stroke: "#10b981",
    fill: "rgba(16, 185, 129, 0.14)",
  },
  danger: {
    panel: "bg-rose-50/70 dark:bg-rose-500/10",
    stroke: "#f43f5e",
    fill: "rgba(244, 63, 94, 0.14)",
  },
} as const;

interface WidgetEntry {
  data: WidgetData;
}

interface Props {
  widgets:       WidgetEntry[];
  initialLayout: WidgetLayoutItem[];
  userId:        string;
  tenantId:      string;
}

// ── Sortable widget card ──────────────────────────────────────────────────────
function SortableWidgetCard({
  entry,
  enabled,
  onToggle,
}: {
  entry:    WidgetEntry;
  enabled:  boolean;
  onToggle: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.data.moduleName });

  const style = {
    transform:  CSS.Transform.toString(transform),
    transition,
    opacity:    isDragging ? 0.5 : 1,
  };

  const Icon = ICON_MAP[entry.data.icon] ?? HiMiniCube;
  const { data } = entry;
  const badgeTone = data.badge?.tone ?? "default";
  const accentTone = data.accentTone ?? "default";
  const accent = ACCENT_STYLES[accentTone];
  const liveSnapshot = data.liveSnapshot;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col rounded-lg border bg-background transition-shadow ${
        enabled ? "border-border" : "border-border/50 opacity-50"
      } ${isDragging ? "shadow-lg" : "hover:shadow-sm"}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="flex h-6 w-6 cursor-grab items-center justify-center rounded text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <HiMiniBars2 className="h-3.5 w-3.5" />
        </button>

        <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
        </span>

        <p className="flex-1 text-sm font-semibold text-foreground">{data.title}</p>

        {data.badge && (
          <span className={`hidden rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] sm:inline-flex ${BADGE_STYLES[badgeTone]}`}>
            {data.badge.label}
          </span>
        )}

        {/* Toggle visibility */}
        <button
          type="button"
          onClick={onToggle}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title={enabled ? "Hide widget" : "Show widget"}
        >
          {enabled
            ? <HiMiniEye className="h-3.5 w-3.5" />
            : <HiMiniEyeSlash className="h-3.5 w-3.5" />}
        </button>

        <Link
          href={data.href}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title={`Open ${data.title}`}
        >
          <HiMiniArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {liveSnapshot ? (
        <BitcoinLiveMetrics snapshot={liveSnapshot} />
      ) : (
        <>
          {/* Body — primary stat */}
          <div className="flex flex-1 flex-col gap-4 px-5 py-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">{data.primary}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {data.primaryLabel}
                </p>
              </div>
              {data.badge && (
                <span className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] sm:hidden ${BADGE_STYLES[badgeTone]}`}>
                  {data.badge.label}
                </span>
              )}
            </div>

            {data.sparkline && data.sparkline.length > 1 ? (
              <div className={`rounded-md border border-border px-3 py-3 ${accent.panel}`}>
                <Sparkline
                  points={data.sparkline}
                  stroke={accent.stroke}
                  fill={accent.fill}
                  className="h-14 w-full"
                />
              </div>
            ) : null}

            {data.meta ? (
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-md border border-border bg-muted/20 px-3 py-2">
                  <p className="text-sm font-semibold tabular-nums text-foreground">{data.meta.left}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{data.meta.leftLabel}</p>
                </div>
                <div className="rounded-md border border-border bg-muted/20 px-3 py-2">
                  <p className="text-sm font-semibold tabular-nums text-foreground">{data.meta.right}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{data.meta.rightLabel}</p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer — secondary stats */}
          {data.stats.length > 0 && (
            <div
              className="grid divide-x divide-border border-t border-border"
              style={{ gridTemplateColumns: `repeat(${data.stats.length}, 1fr)` }}
            >
              {data.stats.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center gap-0.5 px-4 py-3">
                  <p className="text-sm font-semibold tabular-nums text-foreground">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BitcoinLiveMetrics({ snapshot }: { snapshot: BitcoinMarketSnapshot }) {
  const state = useBitcoinLiveMarket(snapshot, { sparklineLimit: 24, tradeLimit: 0 });
  const tone = state.priceChangePercent >= 0 ? "success" : "danger";
  const accent = ACCENT_STYLES[tone];
  const badgeLabel = state.priceChangePercent >= 0 ? "Bullish" : "Pullback";

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 px-5 py-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">{formatUsd(state.lastPrice)}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              BTC/USDT
            </p>
          </div>
          <span className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] sm:hidden ${BADGE_STYLES[tone]}`}>
            {badgeLabel}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="rounded-md border border-border bg-muted/20 px-3 py-2">
            <p className="text-sm font-semibold tabular-nums text-foreground">{formatCompactNumber(state.quoteVolume, 1)}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">24h volume</p>
          </div>
          <div className="rounded-md border border-border bg-muted/20 px-3 py-2">
            <p className="text-sm font-semibold tabular-nums text-foreground">{formatUsd(state.weightedAveragePrice, 0)}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">VWAP</p>
          </div>
        </div>
      </div>

      <div
        className="grid divide-x divide-border border-t border-border"
        style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
      >
        <div className="flex flex-col items-center gap-0.5 px-4 py-3">
          <p className="text-sm font-semibold tabular-nums text-foreground">{formatPercent(state.priceChangePercent)}</p>
          <p className="text-[11px] text-muted-foreground">24h</p>
        </div>
        <div className="flex flex-col items-center gap-0.5 px-4 py-3">
          <p className="text-sm font-semibold tabular-nums text-foreground">{formatUsd(state.highPrice, 0)}</p>
          <p className="text-[11px] text-muted-foreground">High</p>
        </div>
        <div className="flex flex-col items-center gap-0.5 px-4 py-3">
          <p className="text-sm font-semibold tabular-nums text-foreground">{formatUsd(state.lowPrice, 0)}</p>
          <p className="text-[11px] text-muted-foreground">Low</p>
        </div>
      </div>
    </>
  );
}

// ── Main widget area ──────────────────────────────────────────────────────────
export function WidgetArea({ widgets, initialLayout, userId, tenantId }: Props) {
  const toast = useToast();

  // Build initial ordered+enabled state from saved layout or defaults
  const buildInitialState = useCallback((): WidgetLayoutItem[] => {
    const available = widgets.map((w) => w.data.moduleName);

    if (initialLayout.length > 0) {
      // Merge saved layout with currently available widgets
      const saved     = initialLayout.filter((item) => available.includes(item.id));
      const inSaved   = new Set(saved.map((s) => s.id));
      const newOnes   = available
        .filter((id) => !inSaved.has(id))
        .map((id, i) => ({ id, enabled: true, order: saved.length + i }));
      return [...saved, ...newOnes].sort((a, b) => a.order - b.order);
    }

    return available.map((id, i) => ({ id, enabled: true, order: i }));
  }, [widgets, initialLayout]);

  const [layout, setLayout] = useState<WidgetLayoutItem[]>(buildInitialState);
  const [saving, setSaving] = useState(false);
  const dndId = useId();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function persistLayout(next: WidgetLayoutItem[]) {
    setSaving(true);
    const result = await saveWidgetLayout(userId, tenantId, next);
    setSaving(false);
    if (result.error) toast.error("Failed to save layout", result.error);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const ids  = layout.map((item) => item.id);
    const from = ids.indexOf(active.id as string);
    const to   = ids.indexOf(over.id   as string);
    if (from === -1 || to === -1) return;

    const next = arrayMove(layout, from, to).map((item, idx) => ({ ...item, order: idx }));
    setLayout(next);
    void persistLayout(next);
  }

  function handleToggle(id: string) {
    const next = layout.map((item) => (
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ));

    setLayout(next);
    void persistLayout(next);
  }

  // Map module name → widget entry
  const widgetMap = new Map(widgets.map((w): [string, WidgetEntry] => [w.data.moduleName, w]));
  const ordered   = layout.map((item) => ({ item, entry: widgetMap.get(item.id) }))
                          .filter((x): x is { item: WidgetLayoutItem; entry: WidgetEntry } => !!x.entry);
  const visible   = ordered.filter((x) => x.item.enabled);
  const hidden    = ordered.filter((x) => !x.item.enabled);

  if (ordered.length === 0) return null;

  return (
    <div className="space-y-3">
      {saving && (
        <p className="text-right text-[11px] text-muted-foreground">Saving layout…</p>
      )}

      <DndContext
        id={dndId}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={layout.map((i) => i.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ordered.map(({ item, entry }) => (
              <SortableWidgetCard
                key={item.id}
                entry={entry}
                enabled={item.enabled}
                onToggle={() => handleToggle(item.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {hidden.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          {hidden.length} widget{hidden.length > 1 ? "s" : ""} hidden
          {" · "}
          <button
            type="button"
            onClick={() => {
              const next = layout.map((item) => ({ ...item, enabled: true }));
              setLayout(next);
              void persistLayout(next);
            }}
            className="underline underline-offset-2 hover:text-foreground"
          >
            Show all
          </button>
        </p>
      )}
    </div>
  );
}
