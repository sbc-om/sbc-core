"use client";

import { useTransition } from "react";
import { updateLeadStageAction } from "@/actions/crm";
import { useToast } from "@/components/system-feedback";

const STAGES = ["new", "qualified", "proposal", "negotiation", "won", "lost"] as const;
type Stage = typeof STAGES[number];

const STAGE_STYLES: Record<Stage, string> = {
  new:         "bg-muted text-muted-foreground",
  qualified:   "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
  proposal:    "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
  negotiation: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  won:         "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  lost:        "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
};

export function StageBadge({ stage }: { stage: string }) {
  const s = (STAGES.includes(stage as Stage) ? stage : "new") as Stage;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STAGE_STYLES[s]}`}>
      {s}
    </span>
  );
}

export function StageSelect({ id, currentStage }: { id: string; currentStage: string }) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const stage = e.target.value;
    startTransition(async () => {
      const result = await updateLeadStageAction(id, stage);
      if (result.error) toast.error("Failed to update stage", result.error);
    });
  }

  return (
    <select
      defaultValue={currentStage}
      disabled={pending}
      onChange={handleChange}
      className="rounded-md border border-input bg-background px-2 py-1 text-xs font-medium outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:opacity-60 cursor-pointer"
    >
      {STAGES.map((s) => (
        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
      ))}
    </select>
  );
}
