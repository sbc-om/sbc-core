"use client";

import { useState, useCallback, type ComponentType } from "react";
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
import Link from "next/link";
import { saveWidgetLayout, type WidgetLayoutItem } from "@/actions/widget-layout";
import { useToast } from "@/components/system-feedback";
import type { WidgetData } from "@/lib/widget-registry";

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
};

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

      {/* Body — primary stat */}
      <div className="flex flex-1 flex-col items-center justify-center gap-1 px-5 py-8">
        <p className="text-4xl font-semibold tabular-nums text-foreground">{data.primary}</p>
        <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {data.primaryLabel}
        </p>
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
    </div>
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

    setLayout((prev) => {
      const ids   = prev.map((i) => i.id);
      const from  = ids.indexOf(active.id as string);
      const to    = ids.indexOf(over.id   as string);
      const next  = arrayMove(prev, from, to).map((item, idx) => ({ ...item, order: idx }));
      void persistLayout(next);
      return next;
    });
  }

  function handleToggle(id: string) {
    setLayout((prev) => {
      const next = prev.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item,
      );
      void persistLayout(next);
      return next;
    });
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
              setLayout((prev) => {
                const next = prev.map((i) => ({ ...i, enabled: true }));
                void persistLayout(next);
                return next;
              });
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
