import { HiMiniChartBar } from "react-icons/hi2";
import { listLeads } from "@/actions/crm";
import { CreateLeadDialog } from "./_components/create-lead-dialog";
import { DeleteLeadButton } from "./_components/delete-lead-button";
import { StageBadge, StageSelect } from "./_components/stage-select";

const PRIORITY_STYLES: Record<string, string> = {
  low:    "bg-muted text-muted-foreground",
  medium: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  high:   "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
};

function formatValue(value: string | null, currency: string) {
  if (!value) return null;
  const num = parseFloat(value);
  if (isNaN(num)) return null;
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(num);
}

export default async function CrmLeadsPage() {
  const leads = await listLeads();

  const totalValue = leads.reduce((sum, l) => sum + (l.value ? parseFloat(l.value) : 0), 0);
  const wonCount   = leads.filter((l) => l.stage === "won").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Leads</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {leads.length > 0
              ? `${leads.length} lead${leads.length !== 1 ? "s" : ""} · ${wonCount} won`
              : "Track sales opportunities and move them through your pipeline."}
          </p>
        </div>
        <CreateLeadDialog />
      </div>

      {/* Stats row */}
      {leads.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Leads"  value={String(leads.length)} />
          <StatCard label="Won"          value={String(wonCount)} accent="emerald" />
          <StatCard
            label="Pipeline Value"
            value={totalValue > 0 ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(totalValue) : "—"}
            accent="sky"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-background">
        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
              <HiMiniChartBar className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">No leads yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Add your first lead to start tracking your pipeline.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Lead</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground sm:table-cell">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Stage</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground md:table-cell">Priority</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{lead.title}</p>
                      {lead.notes && (
                        <p className="mt-0.5 max-w-xs truncate text-xs text-muted-foreground">{lead.notes}</p>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className="font-mono text-sm text-foreground">
                        {formatValue(lead.value, lead.currency) ?? <span className="text-muted-foreground/40">—</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StageSelect id={lead.id} currentStage={lead.stage} />
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${PRIORITY_STYLES[lead.priority] ?? PRIORITY_STYLES.medium}`}>
                        {lead.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <DeleteLeadButton id={lead.id} title={lead.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label, value, accent,
}: {
  label:   string;
  value:   string;
  accent?: "emerald" | "sky";
}) {
  const valueColor =
    accent === "emerald" ? "text-emerald-600 dark:text-emerald-400" :
    accent === "sky"     ? "text-sky-600 dark:text-sky-400" :
    "text-foreground";

  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1.5 text-2xl font-semibold tabular-nums ${valueColor}`}>{value}</p>
    </div>
  );
}
