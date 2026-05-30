import type { ReactNode } from "react";

export function CallCenterPageShell({
  eyebrow,
  title,
  description,
  actions,
  metrics,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  metrics?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-border bg-background px-5 py-5 shadow-sm sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">{eyebrow}</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          {actions ? <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">{actions}</div> : null}
        </div>
      </header>

      {metrics ? <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{metrics}</section> : null}

      <section className="rounded-3xl border border-border bg-background p-5 shadow-sm sm:p-6">
        {children}
      </section>
    </div>
  );
}

export function CallCenterActionButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex w-full items-center justify-center rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition hover:opacity-90 sm:w-auto"
    >
      {label}
    </button>
  );
}

export function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

const TONES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-400/20",
  available: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-400/20",
  busy: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-400/20",
  break: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-400/20",
  offline: "bg-muted text-muted-foreground border-border",
  open: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-400/20",
  pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-400/20",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-400/20",
  closed: "bg-muted text-muted-foreground border-border",
  high: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-400/20",
  urgent: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-400/20",
  medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-400/20",
  low: "bg-muted text-muted-foreground border-border",
  connected: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-400/20",
  missed: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-400/20",
  voicemail: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-400/20",
  abandoned: "bg-muted text-muted-foreground border-border",
};

export function StatusPill({ value }: { value: string }) {
  const tone = TONES[value.toLowerCase()] ?? "bg-muted text-muted-foreground border-border";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${tone}`}>
      {value.replace(/_/g, " ")}
    </span>
  );
}