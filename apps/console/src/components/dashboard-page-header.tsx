import type { ReactNode } from "react";

export function DashboardPageHeader({
  title,
  actions,
}: {
  title: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 sm:gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl md:text-2xl">
          {title}
        </h1>
      </div>
      {actions ? <div className="flex shrink-0 items-center justify-end gap-2">{actions}</div> : null}
    </div>
  );
}