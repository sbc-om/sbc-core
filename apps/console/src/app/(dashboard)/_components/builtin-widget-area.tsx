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
import { HiMiniCalendarDays } from "react-icons/hi2";
import {
  WiCloud,
  WiDayCloudy,
  WiDaySunny,
  WiFog,
  WiNightAltCloudy,
  WiNightClear,
  WiRain,
  WiSnow,
  WiThunderstorm,
} from "react-icons/wi";
import { saveBuiltinWidgetConfig, type BuiltinWidgetConfig } from "@/actions/builtin-widget-settings";
import { BUILTIN_WIDGETS, type WidgetStatData } from "@/lib/builtin-widgets";

const DEFAULT_WEATHER_COORDS = {
  latitude: 23.588,
  longitude: 58.3829,
  label: "Muscat",
};

type WeatherIconComponent = typeof WiDaySunny;

interface WeatherSnapshot {
  location: string;
  temperature: number;
  temperatureMin: number;
  temperatureMax: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
}

// Accent-only styles — card bg/border comes from the Widget base (bg-card border-border)
const WEATHER_ACCENT = {
  clear: {
    icon: "text-amber-500 dark:text-amber-400",
    temp: "text-amber-600 dark:text-amber-400",
  },
  cloud: {
    icon: "text-sky-500 dark:text-sky-400",
    temp: "text-sky-600 dark:text-sky-400",
  },
  rain: {
    icon: "text-cyan-500 dark:text-cyan-400",
    temp: "text-cyan-600 dark:text-cyan-400",
  },
  storm: {
    icon: "text-violet-500 dark:text-violet-400",
    temp: "text-violet-600 dark:text-violet-400",
  },
  snow: {
    icon: "text-slate-400 dark:text-slate-300",
    temp: "text-slate-600 dark:text-slate-300",
  },
} as const;

const STAT_ACCENT = {
  cube:   "text-emerald-600 dark:text-emerald-400",
  users:  "text-sky-600 dark:text-sky-400",
  bolt:   "text-fuchsia-600 dark:text-fuchsia-400",
  shield: "text-teal-600 dark:text-teal-400",
} as const;

function getWeatherPresentation(code: number, isDay: boolean) {
  type WeatherTone = keyof typeof WEATHER_ACCENT;

  if (code === 0) {
    return {
      label: isDay ? "Sunny" : "Clear night",
      Icon: isDay ? WiDaySunny : WiNightClear,
      tone: "clear" as WeatherTone,
    };
  }
  if ([1, 2, 3].includes(code)) {
    return {
      label: code === 1 ? "Mostly clear" : "Partly cloudy",
      Icon: isDay ? WiDayCloudy : WiNightAltCloudy,
      tone: "cloud" as WeatherTone,
    };
  }
  if ([45, 48].includes(code)) {
    return { label: "Fog", Icon: WiFog, tone: "cloud" as WeatherTone };
  }
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { label: "Rain showers", Icon: WiRain, tone: "rain" as WeatherTone };
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { label: "Snow", Icon: WiSnow, tone: "snow" as WeatherTone };
  }
  if ([95, 96, 99].includes(code)) {
    return { label: "Storm", Icon: WiThunderstorm, tone: "storm" as WeatherTone };
  }
  return { label: "Cloudy", Icon: WiCloud, tone: "cloud" as WeatherTone };
}

// ── Clock ──────────────────────────────────────────────────────────────────────
function ClockWidget() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const h    = time ? time.getHours() % 12 || 12 : "--";
  const m    = time ? String(time.getMinutes()).padStart(2, "0") : "--";
  const s    = time ? String(time.getSeconds()).padStart(2, "0") : "--";
  const ampm = time ? (time.getHours() >= 12 ? "PM" : "AM") : "--";

  return (
    <Widget className="overflow-hidden">
      <WidgetHeader>
        <WidgetTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Time
        </WidgetTitle>
        <p className="text-[10px] font-semibold text-muted-foreground">{ampm}</p>
      </WidgetHeader>
      <WidgetContent className="flex-col items-start gap-1">
        <WidgetTitle className="text-3xl font-bold tabular-nums tracking-wider text-violet-600 dark:text-violet-400">
          {h}:{m}
        </WidgetTitle>
        <p className="text-[10px] font-semibold tabular-nums text-muted-foreground">
          {s}s
        </p>
      </WidgetContent>
    </Widget>
  );
}

// ── Calendar ───────────────────────────────────────────────────────────────────
function CalendarWidget() {
  const [date, setDate] = useState<Date | null>(null);

  useEffect(() => {
    setDate(new Date());
    const t = setInterval(() => setDate(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const day   = date ? date.toLocaleDateString("en-US", { weekday: "short" }) : "---";
  const month = date ? date.toLocaleDateString("en-US", { month: "short" }).toUpperCase() : "---";
  const year  = date ? date.getFullYear() : "----";

  return (
    <Widget design="mumbai" className="overflow-hidden">
      <WidgetHeader>
        <div>
          <WidgetTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {day}
          </WidgetTitle>
          <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">{year}</p>
        </div>
        <HiMiniCalendarDays className="h-4 w-4 text-rose-500 dark:text-rose-400" />
      </WidgetHeader>
      <WidgetContent className="flex-col items-start gap-1">
        <p className="text-4xl font-bold tabular-nums leading-none text-foreground">
          {date ? date.getDate() : "--"}
        </p>
        <p className="text-[10px] font-bold tracking-[0.28em] text-muted-foreground">{month}</p>
      </WidgetContent>
    </Widget>
  );
}

// ── Weather ────────────────────────────────────────────────────────────────────
function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    const fetchWeather = async (latitude: number, longitude: number, fallbackLabel: string) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m,is_day&daily=temperature_2m_max,temperature_2m_min&forecast_days=1&timezone=auto`,
        );
        if (!response.ok) throw new Error("weather_unavailable");

        const payload = await response.json() as {
          current?: {
            temperature_2m: number;
            weather_code: number;
            wind_speed_10m: number;
            is_day: number;
          };
          daily?: {
            temperature_2m_max?: number[];
            temperature_2m_min?: number[];
          };
        };

        if (!payload.current) throw new Error("weather_missing");
        if (cancelled) return;

        setWeather({
          location: fallbackLabel,
          temperature: Math.round(payload.current.temperature_2m),
          temperatureMin: Math.round(payload.daily?.temperature_2m_min?.[0] ?? payload.current.temperature_2m),
          temperatureMax: Math.round(payload.daily?.temperature_2m_max?.[0] ?? payload.current.temperature_2m),
          windSpeed: Math.round(payload.current.wind_speed_10m),
          weatherCode: payload.current.weather_code,
          isDay: payload.current.is_day === 1,
        });
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    };

    void fetchWeather(
      DEFAULT_WEATHER_COORDS.latitude,
      DEFAULT_WEATHER_COORDS.longitude,
      DEFAULT_WEATHER_COORDS.label,
    );

    return () => { cancelled = true; };
  }, []);

  if (status !== "ready" || !weather) {
    return (
      <Widget className="overflow-hidden">
        <WidgetHeader>
          <WidgetTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Weather
          </WidgetTitle>
          <p className="text-[9px] font-semibold uppercase text-muted-foreground">
            {status === "error" ? "Offline" : "Loading"}
          </p>
        </WidgetHeader>
        <WidgetContent className="flex-col items-start justify-center gap-2">
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="h-8 w-24 animate-pulse rounded bg-muted" />
          <div className="h-2.5 w-28 animate-pulse rounded bg-muted/70" />
        </WidgetContent>
      </Widget>
    );
  }

  const presentation = getWeatherPresentation(weather.weatherCode, weather.isDay);
  const accent = WEATHER_ACCENT[presentation.tone];
  const Icon = presentation.Icon;

  return (
    <Widget className="overflow-hidden">
      <WidgetHeader>
        <WidgetTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {weather.location}
        </WidgetTitle>
        <p className="text-[9px] font-semibold uppercase text-muted-foreground">
          {weather.isDay ? "Day" : "Night"}
        </p>
      </WidgetHeader>

      <WidgetContent className="flex-col items-stretch justify-between">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-3xl font-bold tabular-nums leading-none ${accent.temp}`}>
              {weather.temperature}°
            </p>
            <p className="mt-1 text-[10px] font-semibold text-muted-foreground">
              {presentation.label}
            </p>
          </div>
          <Icon className={`weather-float h-11 w-11 ${accent.icon}`} />
        </div>

        <div className="grid grid-cols-3 gap-1">
          {[
            { value: `${weather.temperatureMax}°`, label: "High" },
            { value: `${weather.temperatureMin}°`, label: "Low" },
            { value: String(weather.windSpeed),    label: "km/h" },
          ].map(({ value, label }) => (
            <div key={label} className="rounded-md border border-border bg-muted/40 px-1.5 py-1">
              <p className="text-xs font-semibold tabular-nums leading-none text-foreground">
                {value}
              </p>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                {label}
              </p>
            </div>
          ))}
        </div>
      </WidgetContent>
    </Widget>
  );
}

// ── Stat widget ────────────────────────────────────────────────────────────────
function StatWidget({ data }: { data: WidgetStatData }) {
  const valueClass = STAT_ACCENT[data.icon];

  return (
    <Widget design="mumbai" className="overflow-hidden">
      <WidgetHeader>
        <WidgetTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {data.label}
        </WidgetTitle>
      </WidgetHeader>
      <WidgetContent className="flex-col items-start">
        <p className={`text-3xl font-bold tabular-nums ${valueClass}`}>{data.value}</p>
      </WidgetContent>
      <WidgetFooter>
        <p className="text-[10px] font-semibold text-muted-foreground">{data.sub}</p>
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
      case "clock":        return <ClockWidget />;
      case "weather":      return <WeatherWidget />;
      case "calendar":     return <CalendarWidget />;
      case "stat-modules": return <StatWidget data={serverData["stat-modules"]!} />;
      case "stat-users":   return <StatWidget data={serverData["stat-users"]!} />;
      case "stat-events":  return <StatWidget data={serverData["stat-events"]!} />;
      case "stat-audit":   return <StatWidget data={serverData["stat-audit"]!} />;
      default:             return null;
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

    const ids  = config.map((c) => c.id);
    const from = ids.indexOf(active.id as string);
    const to   = ids.indexOf(over.id as string);

    if (from === -1 || to === -1) return;

    const next = arrayMove(config, from, to).map((c, i) => ({ ...c, order: i }));
    setConfig(next);
    void persist(next);
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
