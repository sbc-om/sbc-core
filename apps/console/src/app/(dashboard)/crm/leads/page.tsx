import { HiMiniChartBar } from "react-icons/hi2";
import { listLeads, listPipelines } from "@/actions/crm";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { CreateLeadDialog } from "./_components/create-lead-dialog";
import { KanbanBoard } from "./_components/kanban-board";

const FALLBACK_STAGES = ["new", "qualified", "proposal", "negotiation", "won", "lost"] as const;

export default async function CrmLeadsPage() {
  const [leads, pipelines] = await Promise.all([listLeads(), listPipelines()]);

  const defaultPipeline = pipelines.find((pipeline) => pipeline.is_default) ?? pipelines[0];
  const stageOrder = defaultPipeline?.stages.length
    ? defaultPipeline.stages.map((stage) => stage.name.toLowerCase())
    : [...FALLBACK_STAGES];
  const stageColumns = stageOrder.map((stage) => ({
    stage,
    leads: leads.filter((lead) => lead.stage.toLowerCase() === stage),
  }));

  const totalValue = leads.reduce((sum, l) => sum + (l.value ? parseFloat(l.value) : 0), 0);
  const wonCount   = leads.filter((l) => l.stage === "won").length;

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-hidden">
      <DashboardPageHeader title="Leads" actions={<CreateLeadDialog />} />

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

      {/* Kanban board */}
      <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-border bg-background">
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
          <KanbanBoard initialLeads={leads} stageOrder={stageOrder} />
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
