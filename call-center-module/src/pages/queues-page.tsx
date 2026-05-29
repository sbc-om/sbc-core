import { ModuleActionButton, ModulePageShell } from "../components/module-page-shell";
import { StatusPill } from "../components/status-pill";
import { queues } from "../lib/demo-data";

export function CallCenterQueuesPage() {
  return (
    <ModulePageShell
      eyebrow="Call Center"
      title="Queues"
      description="Configure routing lanes, SLA targets, and staffing pressure for every service queue."
      actions={<ModuleActionButton label="New Queue" />}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {queues.map((queue) => (
          <article key={queue.code} className="rounded-2xl border border-slate-200 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{queue.code}</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950">{queue.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{queue.channel} · {queue.strategy}</p>
              </div>
              <StatusPill value={queue.status} />
            </div>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              <QueueStat label="Active Agents" value={String(queue.activeAgents)} />
              <QueueStat label="Open Tickets" value={String(queue.openTickets)} />
              <QueueStat label="First Response SLA" value={`${queue.slaFirstResponseMin} min`} />
              <QueueStat label="Resolution SLA" value={`${queue.slaResolutionMin} min`} />
            </dl>
          </article>
        ))}
      </div>
    </ModulePageShell>
  );
}

function QueueStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</dt>
      <dd className="mt-2 text-lg font-semibold text-slate-950">{value}</dd>
    </div>
  );
}
