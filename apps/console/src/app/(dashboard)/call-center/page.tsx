import {
  CallCenterActionButton,
  CallCenterPageShell,
  MetricCard,
  StatusPill,
} from "./_components/page-shell";
import { overviewMetrics, queues, tickets } from "./_lib/demo-data";

export default function CallCenterOverviewPage() {
  return (
    <CallCenterPageShell
      eyebrow="Call Center"
      title="Operations Overview"
      description="Track queues, ticket pressure, and service health from one operational cockpit for supervisors and team leads."
      actions={(
        <>
          <CallCenterActionButton label="Create Ticket" />
          <CallCenterActionButton label="Add Queue" />
        </>
      )}
      metrics={overviewMetrics.map((metric) => (
        <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
      ))}
    >
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-border p-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Queue Snapshot</h2>
            <p className="mt-1 text-sm text-muted-foreground">Live pressure, staffing, and SLA profile by queue.</p>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/30 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Queue</th>
                  <th className="px-4 py-3 font-medium">Agents</th>
                  <th className="px-4 py-3 font-medium">Open</th>
                  <th className="px-4 py-3 font-medium">SLA</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {queues.map((queue) => (
                  <tr key={queue.code} className="border-t border-border">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{queue.name}</p>
                      <p className="text-xs text-muted-foreground">{queue.strategy}</p>
                    </td>
                    <td className="px-4 py-3">{queue.activeAgents}</td>
                    <td className="px-4 py-3">{queue.openTickets}</td>
                    <td className="px-4 py-3">{queue.slaFirstResponseMin}m / {queue.slaResolutionMin}m</td>
                    <td className="px-4 py-3"><StatusPill value={queue.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-border p-5">
          <h2 className="text-lg font-semibold text-foreground">Priority Tickets</h2>
          <p className="mt-1 text-sm text-muted-foreground">Items requiring immediate action.</p>
          <div className="mt-4 space-y-3">
            {tickets.slice(0, 3).map((ticket) => (
              <div key={ticket.code} className="rounded-2xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{ticket.code}</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{ticket.subject}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{ticket.queue} · {ticket.assignee}</p>
                  </div>
                  <StatusPill value={ticket.priority} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CallCenterPageShell>
  );
}