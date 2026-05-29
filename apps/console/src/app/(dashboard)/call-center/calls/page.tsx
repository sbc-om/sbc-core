import { CallCenterActionButton, CallCenterPageShell, StatusPill } from "../_components/page-shell";
import { calls } from "../_lib/demo-data";

export default function CallCenterCallsPage() {
  return (
    <CallCenterPageShell
      eyebrow="Call Center"
      title="Calls"
      description="Review inbound and outbound activity with timing, queue context, and outcome tracking."
      actions={<CallCenterActionButton label="Log Call" />}
    >
      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/30 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Direction</th>
              <th className="px-4 py-3 font-medium">Queue</th>
              <th className="px-4 py-3 font-medium">Agent</th>
              <th className="px-4 py-3 font-medium">Number</th>
              <th className="px-4 py-3 font-medium">Started</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Outcome</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr key={`${call.agent}-${call.startedAt}-${call.number}`} className="border-t border-border">
                <td className="px-4 py-3 font-medium text-foreground">{call.direction}</td>
                <td className="px-4 py-3">{call.queue}</td>
                <td className="px-4 py-3">{call.agent}</td>
                <td className="px-4 py-3">{call.number}</td>
                <td className="px-4 py-3">{call.startedAt}</td>
                <td className="px-4 py-3">{call.duration}</td>
                <td className="px-4 py-3"><StatusPill value={call.outcome} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CallCenterPageShell>
  );
}