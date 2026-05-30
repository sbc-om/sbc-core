import { CallCenterActionButton, CallCenterEmptyState, CallCenterPageShell, StatusPill } from "../_components/page-shell";
import { tickets } from "../_lib/demo-data";

export default function CallCenterTicketsPage() {
  return (
    <CallCenterPageShell
      eyebrow="Call Center"
      title="Tickets"
      description="Follow every support and follow-up ticket with clear ownership, urgency, and SLA visibility."
      actions={<CallCenterActionButton label="Create Ticket" />}
    >
      {tickets.length === 0 ? (
        <CallCenterEmptyState
          title="No tickets in the queue"
          description="Tickets will appear here as soon as the team starts logging customer work or inbound cases."
        />
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <article key={ticket.code} className="rounded-lg border border-border p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{ticket.code}</p>
                  <h2 className="mt-1 text-lg font-semibold text-foreground">{ticket.subject}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{ticket.queue} · Assigned to {ticket.assignee}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill value={ticket.priority} />
                  <StatusPill value={ticket.status} />
                </div>
              </div>
              <div className="mt-4 grid gap-3 rounded-md bg-muted/30 p-4 sm:grid-cols-3">
                <TicketMeta label="Queue" value={ticket.queue} />
                <TicketMeta label="Assignee" value={ticket.assignee} />
                <TicketMeta label="SLA Due" value={ticket.slaDue} />
              </div>
            </article>
          ))}
        </div>
      )}
    </CallCenterPageShell>
  );
}

function TicketMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}