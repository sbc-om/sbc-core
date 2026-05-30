import { CallCenterActionButton, CallCenterEmptyState, CallCenterPageShell, StatusPill } from "../_components/page-shell";
import { agents } from "../_lib/demo-data";

export default function CallCenterAgentsPage() {
  return (
    <CallCenterPageShell
      eyebrow="Call Center"
      title="Agents"
      description="Monitor staffing, queue coverage, and utilization so supervisors can rebalance work before SLA drift."
      actions={<CallCenterActionButton label="Invite Agent" />}
    >
      {agents.length === 0 ? (
        <CallCenterEmptyState
          title="No agents onboarded"
          description="Invite call center agents when you are ready to manage staffing, coverage, and utilization here."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="bg-muted/30 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Agent</th>
                <th className="px-4 py-3 font-medium">Queue</th>
                <th className="px-4 py-3 font-medium">Extension</th>
                <th className="px-4 py-3 font-medium">Skill</th>
                <th className="px-4 py-3 font-medium">Utilization</th>
                <th className="px-4 py-3 font-medium">Calls Today</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.extension} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-foreground">{agent.name}</td>
                  <td className="px-4 py-3">{agent.queue}</td>
                  <td className="px-4 py-3">{agent.extension}</td>
                  <td className="px-4 py-3 capitalize">{agent.skill}</td>
                  <td className="px-4 py-3">{agent.utilization}</td>
                  <td className="px-4 py-3">{agent.todayCalls}</td>
                  <td className="px-4 py-3"><StatusPill value={agent.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CallCenterPageShell>
  );
}