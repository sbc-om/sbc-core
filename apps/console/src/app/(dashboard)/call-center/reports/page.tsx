import { CallCenterEmptyState, CallCenterPageShell, MetricCard } from "../_components/page-shell";
import { queuePerformance, reportHighlights } from "../_lib/demo-data";

export default function CallCenterReportsPage() {
  return (
    <CallCenterPageShell
      eyebrow="Call Center"
      title="Reports"
      description="Review queue efficiency, SLA attainment, and customer experience trends across the operation."
      metrics={reportHighlights.map((metric) => (
        <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
      ))}
    >
      {queuePerformance.length === 0 ? (
        <CallCenterEmptyState
          title="No reporting data yet"
          description="Performance reporting will become available once queues, calls, tickets, and SLA activity start generating operational history."
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="bg-muted/30 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Queue</th>
                  <th className="px-4 py-3 font-medium">Answered</th>
                  <th className="px-4 py-3 font-medium">Resolution</th>
                  <th className="px-4 py-3 font-medium">Backlog</th>
                </tr>
              </thead>
              <tbody>
                {queuePerformance.map((row) => (
                  <tr key={row.queue} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-foreground">{row.queue}</td>
                    <td className="px-4 py-3">{row.answered}</td>
                    <td className="px-4 py-3">{row.resolution}</td>
                    <td className="px-4 py-3">{row.backlog}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </CallCenterPageShell>
  );
}