"use client";

import { useState, useEffect, useCallback, useId } from "react";
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
import { cn } from "@sbc/ui";
import {
  Widget,
  WidgetHeader,
  WidgetTitle,
  WidgetContent,
  WidgetFooter,
} from "@/components/ui/widget";
import {
  HiMiniBolt,
  HiMiniCube,
  HiMiniShieldCheck,
  HiMiniUsers,
} from "react-icons/hi2";
import { saveBuiltinWidgetConfig, type BuiltinWidgetConfig } from "@/actions/builtin-widget-settings";
import { BUILTIN_WIDGETS, type WidgetStatData } from "@/lib/builtin-widgets";

// ── Clock ──────────────────────────────────────────────────────────────────────
function ClockWidget() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const h   = time.getHours() % 12 || 12;
  const m   = String(time.getMinutes()).padStart(2, "0");
  const s   = String(time.getSeconds()).padStart(2, "0");
  const ampm = time.getHours() >= 12 ? "PM" : "AM";

  return (
    <Widget>
      <WidgetContent className="flex-col gap-1">
        <WidgetTitle className="text-4xl tabular-nums tracking-widest">
          {h}:{m}
        </WidgetTitle>
        <p className="flex items-center gap-2 text-xs text-muted-foreground tabular-nums">
          <span>{s}s</span>
          <span className="font-medium">{ampm}</span>
        </p>
      </WidgetContent>
    </Widget>
  );
}

// ── Calendar ───────────────────────────────────────────────────────────────────
function CalendarWidget() {
  const [date, setDate] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setDate(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const day   = date.toLocaleDateString("en-US", { weekday: "short" });
  const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const year  = date.getFullYear();

  return (
    <Widget design="mumbai">
      <WidgetHeader>
        <WidgetTitle className="text-xs text-muted-foreground">{day}</WidgetTitle>
        <WidgetTitle className="text-xs text-muted-foreground">{year}</WidgetTitle>
      </WidgetHeader>
      <WidgetContent className="flex-col gap-0.5">
        <p className="text-6xl font-bold tabular-nums leading-none">{date.getDate()}</p>
        <p className="text-sm font-medium text-muted-foreground">{month}</p>
      </WidgetContent>
    </Widget>
  );
}

// ── Stat widget ────────────────────────────────────────────────────────────────
const STAT_ICONS = {
  cube:   HiMiniCube,
  users:  HiMiniUsers,
  bolt:   HiMiniBolt,
  shield: HiMiniShieldCheck,
};

function StatWidget({ data }: { data: WidgetStatData }) {
  const Icon = STAT_ICONS[data.icon];
  return (
    <Widget design="mumbai">
      <WidgetHeader>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </WidgetHeader>
      <WidgetContent className="flex-col gap-1">
        <p className="text-5xl font-bold tabular-nums">{data.value}</p>
      </WidgetContent>
      <WidgetFooter>
        <p className="text-xs text-muted-foreground">{data.sub}</p>
      </WidgetFooter>
    </Widget>
  );
}

// ── Sortable wrapper ───────────────────────────────────────────────────────────
function SortableWidget({
  id,
  enabled,
  serverData,
}: {
  id:         string;
  enabled:    boolean;
  serverData: Record<string, WidgetStatData>;
}) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id });

  const style = {
    transform:  CSS.Transform.toString(transform),
    transition,
    opacity:    isDragging ? 0.4 : 1,
  };

  const content = (() => {
    switch (id) {
      case "clock":       return <ClockWidget />;
      case "calendar":    return <CalendarWidget />;
      case "stat-modules":return <StatWidget data={serverData["stat-modules"]!} />;
      case "stat-users":  return <StatWidget data={serverData["stat-users"]!} />;
      case "stat-events": return <StatWidget data={serverData["stat-events"]!} />;
      case "stat-audit":  return <StatWidget data={serverData["stat-audit"]!} />;
      default:            return null;
    }
  })();

  if (!content) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-grab select-none active:cursor-grabbing",
        !enabled && "opacity-40",
      )}
      {...attributes}
      {...listeners}
    >
      {content}
    </div>
  );
}

// ── Main area ──────────────────────────────────────────────────────────────────
interface Props {
  initialConfig: BuiltinWidgetConfig[];
  serverData:    Record<string, WidgetStatData>;
  userId:        string;
  tenantId:      string;
}

export function BuiltinWidgetArea({
  initialConfig,
  serverData,
  userId,
  tenantId,
}: Props) {
  const buildConfig = useCallback((): BuiltinWidgetConfig[] => {
    const allIds = BUILTIN_WIDGETS.map((w) => w.id);

    if (initialConfig.length > 0) {
      const saved   = initialConfig.filter((c) => allIds.includes(c.id));
      const inSaved = new Set(saved.map((c) => c.id));
      const newOnes = allIds
        .filter((id) => !inSaved.has(id))
        .map((id, i) => ({ id, enabled: true, order: saved.length + i }));
      return [...saved, ...newOnes].sort((a, b) => a.order - b.order);
    }

    return allIds.map((id, i) => ({ id, enabled: true, order: i }));
  }, [initialConfig]);

  const [config, setConfig] = useState<BuiltinWidgetConfig[]>(buildConfig);
  const dndId = useId();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function persist(next: BuiltinWidgetConfig[]) {
    await saveBuiltinWidgetConfig(userId, tenantId, next);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setConfig((prev) => {
      const ids  = prev.map((c) => c.id);
      const from = ids.indexOf(active.id as string);
      const to   = ids.indexOf(over.id   as string);
      const next = arrayMove(prev, from, to).map((c, i) => ({ ...c, order: i }));
      void persist(next);
      return next;
    });
  }

  const visible = config.filter((c) => c.enabled);

  if (visible.length === 0) return null;

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={config.map((c) => c.id)} strategy={rectSortingStrategy}>
        <div className="flex flex-wrap gap-4">
          {config.map((c) =>
            c.enabled ? (
              <SortableWidget
                key={c.id}
                id={c.id}
                enabled={c.enabled}
                serverData={serverData}
              />
            ) : null,
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}
