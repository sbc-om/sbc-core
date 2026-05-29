import { ModuleActionButton, ModulePageShell } from "../components/module-page-shell";
import { StatusPill } from "../components/status-pill";
import { agents } from "../lib/demo-data";

export function CallCenterAgentsPage() {
  return (
    <ModulePageShell
      eyebrow="Call Center"
      title="Agents"
      description="Monitor staffing, queue coverage, and utilization so supervisors can rebalance work before SLA drift."
      actions={<ModuleActionButton label="Invite Agent" />}
    >
      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
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
              <tr key={agent.extension} className="border-t border-slate-200">
                <td className="px-4 py-3 font-medium text-slate-950">{agent.name}</td>
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
    </ModulePageShell>
  );
}
