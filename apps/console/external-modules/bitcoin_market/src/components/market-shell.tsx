import type { ReactNode } from "react";

export function BitcoinMarketShell({
  title,
  metrics,
  children,
}: {
  title: string;
  metrics?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-border bg-background px-5 py-5 shadow-sm sm:px-6">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl md:text-2xl">{title}</h1>
          </div>
        </div>
      </header>

      {metrics ? <section className="grid gap-4 lg:grid-cols-4">{metrics}</section> : null}

      <section className="rounded-lg border border-border bg-background p-5 shadow-sm sm:p-6">
        {children}
      </section>
    </div>
  );
}

export function BitcoinMetricCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}