import type { ReactNode } from "react";

export function ModulePageShell({
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
    <div className="min-h-screen bg-slate-50 px-6 py-8 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">{eyebrow}</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
          </div>
        </header>

        {metrics ? <section className="grid gap-4 lg:grid-cols-4">{metrics}</section> : null}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {children}
        </section>
      </div>
    </div>
  );
}

export function ModuleActionButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
    >
      {label}
    </button>
  );
}
