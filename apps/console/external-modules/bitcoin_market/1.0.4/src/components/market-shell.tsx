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
      <header className="rounded-xl border border-border bg-background px-6 py-5 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      </header>

      {metrics ? <section className="grid gap-4 lg:grid-cols-4">{metrics}</section> : null}

      <section className="rounded-xl border border-border bg-background p-6 shadow-sm">
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