import { CallCenterActionButton, CallCenterPageShell, StatusPill } from "../_components/page-shell";
import { queues } from "../_lib/demo-data";

export default function CallCenterQueuesPage() {
  return (
    <CallCenterPageShell
      eyebrow="Call Center"
      title="Queues"
      description="Configure routing lanes, SLA targets, and staffing pressure for every service queue."
      actions={<CallCenterActionButton label="New Queue" />}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {queues.map((queue) => (
          <article key={queue.code} className="rounded-2xl border border-border p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{queue.code}</p>
                <h2 className="mt-1 text-lg font-semibold text-foreground">{queue.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{queue.channel} · {queue.strategy}</p>
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
    </CallCenterPageShell>
  );
}

function QueueStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/30 p-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
      <dd className="mt-2 text-lg font-semibold text-foreground">{value}</dd>
    </div>
  );
}