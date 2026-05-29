import Link from "next/link";
import type { ComponentType } from "react";
import { HiMiniArrowRight } from "react-icons/hi2";
import type { WidgetData } from "@/lib/widget-registry";

interface Props {
  data:      WidgetData;
  Icon:      ComponentType<{ className?: string }>;
}

export function WidgetCard({ data, Icon }: Props) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
            <Icon className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-foreground">{data.title}</p>
        </div>
        <Link
          href={data.href}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title={`Open ${data.title}`}
        >
          <HiMiniArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Primary stat */}
      <div className="flex flex-1 flex-col items-center justify-center gap-1 px-5 py-6">
        <p className="text-4xl font-semibold tabular-nums text-foreground">{data.primary}</p>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {data.primaryLabel}
        </p>
      </div>

      {/* Secondary stats */}
      {data.stats.length > 0 && (
        <div className="grid divide-x divide-border border-t border-border" style={{ gridTemplateColumns: `repeat(${data.stats.length}, 1fr)` }}>
          {data.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-0.5 px-4 py-3">
              <p className="text-base font-semibold tabular-nums text-foreground">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
