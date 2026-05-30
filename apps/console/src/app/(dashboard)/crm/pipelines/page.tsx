import { HiMiniSquares2X2, HiMiniCheckCircle, HiMiniChevronRight } from "react-icons/hi2";
import { listPipelines } from "@/actions/crm";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { CreatePipelineDialog } from "./_components/create-pipeline-dialog";
import { DeletePipelineButton } from "./_components/delete-pipeline-button";

const STAGE_COLORS = [
  "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
  "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
  "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
  "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
];

export default async function CrmPipelinesPage() {
  const pipelines = await listPipelines();

  return (
    <div className="space-y-6">
      <DashboardPageHeader title="Pipelines" actions={<CreatePipelineDialog />} />

      {/* Empty state */}
      {pipelines.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-background py-24 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
            <HiMiniSquares2X2 className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">No pipelines yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create a pipeline to organize your leads into stages.
            </p>
          </div>
        </div>
      )}

      {/* Pipeline cards */}
      <div className="space-y-4">
        {pipelines.map((pipeline) => (
          <div key={pipeline.id} className="overflow-hidden rounded-lg border border-border bg-background">

            {/* Pipeline header */}
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted">
                  <HiMiniSquares2X2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-foreground">{pipeline.name}</h2>
                    {pipeline.is_default && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        <HiMiniCheckCircle className="h-3 w-3" />
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {pipeline.stages.length} stage{pipeline.stages.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <DeletePipelineButton id={pipeline.id} name={pipeline.name} />
            </div>

            {/* Stages flow */}
            <div className="overflow-x-auto px-5 py-4">
              {pipeline.stages.length === 0 ? (
                <p className="text-xs text-muted-foreground">No stages defined.</p>
              ) : (
                <div className="flex min-w-max items-stretch gap-0">
                  {pipeline.stages.map((stage, i) => {
                    const colorCls = stage.is_won
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 ring-emerald-200/60 dark:ring-emerald-400/20"
                      : stage.is_lost
                      ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 ring-rose-200/60 dark:ring-rose-400/20"
                      : [
                          "bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300 ring-slate-200/60 dark:ring-slate-400/20",
                          "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300 ring-sky-200/60 dark:ring-sky-400/20",
                          "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300 ring-violet-200/60 dark:ring-violet-400/20",
                          "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 ring-amber-200/60 dark:ring-amber-400/20",
                          "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-300 ring-fuchsia-200/60 dark:ring-fuchsia-400/20",
                          "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300 ring-teal-200/60 dark:ring-teal-400/20",
                        ][i % 6];

                    const isLast = i === pipeline.stages.length - 1;

                    return (
                      <div key={stage.id} className="flex items-center">
                        {/* Stage pill */}
                        <div className={`flex min-w-[88px] flex-col items-center justify-center rounded-lg px-4 py-3 ring-1 ring-inset ${colorCls}`}>
                          <span className="whitespace-nowrap text-xs font-semibold leading-tight">
                            {stage.name}
                          </span>
                          {stage.probability !== null && (
                            <span className="mt-1 text-[10px] font-medium opacity-60">
                              {stage.probability}%
                            </span>
                          )}
                        </div>

                        {/* Arrow between stages */}
                        {!isLast && (
                          <div className="flex shrink-0 items-center px-1">
                            <HiMiniChevronRight className="h-5 w-5 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
