import type { ReactNode } from "react";

export function BitcoinMarketShell({
  eyebrow,
  title,
  description,
  metrics,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  metrics?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-[28px] border border-amber-200/70 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.28),_transparent_32%),linear-gradient(135deg,_rgba(255,251,235,0.96),_rgba(255,255,255,0.98))] px-6 py-7 shadow-sm">
        <div className="flex flex-col gap-3 lg:max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">{eyebrow}</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </header>

      {metrics ? <section className="grid gap-4 lg:grid-cols-4">{metrics}</section> : null}

      <section className="rounded-[28px] border border-border bg-background p-6 shadow-sm">
        {children}
      </section>
    </div>
  );
}

export function BitcoinMetricCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-3xl border border-border bg-background p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}