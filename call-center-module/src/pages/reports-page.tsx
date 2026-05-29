import { ModulePageShell } from "../components/module-page-shell";
import { MetricCard } from "../components/metric-card";
import { queuePerformance, reportHighlights } from "../lib/demo-data";

export function CallCenterReportsPage() {
  return (
    <ModulePageShell
      eyebrow="Call Center"
      title="Reports"
      description="Review queue efficiency, SLA attainment, and customer experience trends across the operation."
      metrics={reportHighlights.map((metric) => (
        <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
      ))}
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Queue</th>
                <th className="px-4 py-3 font-medium">Answered</th>
                <th className="px-4 py-3 font-medium">Resolution</th>
                <th className="px-4 py-3 font-medium">Backlog</th>
              </tr>
            </thead>
            <tbody>
              {queuePerformance.map((row) => (
                <tr key={row.queue} className="border-t border-slate-200">
                  <td className="px-4 py-3 font-medium text-slate-950">{row.queue}</td>
                  <td className="px-4 py-3">{row.answered}</td>
                  <td className="px-4 py-3">{row.resolution}</td>
                  <td className="px-4 py-3">{row.backlog}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-2xl border border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-950">Supervisor Notes</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li>VIP Desk is outperforming target across both first response and resolution windows.</li>
            <li>General Support backlog is growing faster than staffing coverage during the 9-11 AM window.</li>
            <li>Outbound Sales has room to improve callback completion by tightening voicemail follow-up.</li>
            <li>Escalations should add one floating senior agent during renewal peaks.</li>
          </ul>
        </div>
      </div>
    </ModulePageShell>
  );
}
