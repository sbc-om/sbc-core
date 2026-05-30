"use client";

import { useMemo, useState, useTransition, type ButtonHTMLAttributes } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { HiMiniBars2 } from "react-icons/hi2";
import { updateLeadStageAction, type CrmLead } from "@/actions/crm";
import { useToast } from "@/components/system-feedback";
import { DeleteLeadButton } from "./delete-lead-button";
import { StageBadge, StageSelect } from "./stage-select";

const PRIORITY_STYLES: Record<string, string> = {
  low:    "bg-muted text-muted-foreground",
  medium: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  high:   "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
};

function normalizeStage(stage: string): string {
  return stage.trim().toLowerCase();
}

function formatValue(value: string | null, currency: string) {
  if (!value) return null;
  const num = parseFloat(value);
  if (isNaN(num)) return null;
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(num);
}

function LeadCard({
  lead,
  stages,
  dragHandle,
  dragging,
  onStageChange,
  onDeleted,
}: {
  lead: CrmLead;
  stages: string[];
  dragHandle?: ButtonHTMLAttributes<HTMLButtonElement>;
  dragging?: boolean;
  onStageChange: (nextStage: string) => void;
  onDeleted: () => void;
}) {
  return (
    <article
      className={`rounded-xl border border-border bg-background p-4 shadow-sm transition hover:border-foreground/15 hover:shadow-md ${dragging ? "opacity-50 shadow-lg" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{lead.title}</p>
          {lead.notes && (
            <p className="mt-1 line-clamp-3 text-xs leading-5 text-muted-foreground">{lead.notes}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {dragHandle && (
            <button
              type="button"
              aria-label="Drag lead"
              className="flex h-8 w-8 cursor-grab items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-foreground/15 hover:bg-muted active:cursor-grabbing"
              {...dragHandle}
            >
              <HiMiniBars2 className="h-3.5 w-3.5" />
            </button>
          )}
          <DeleteLeadButton id={lead.id} title={lead.title} onDeleted={onDeleted} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${PRIORITY_STYLES[lead.priority] ?? PRIORITY_STYLES.medium}`}>
          {lead.priority}
        </span>
        <span className="font-mono text-xs text-foreground">
          {formatValue(lead.value, lead.currency) ?? <span className="text-muted-foreground/40">—</span>}
        </span>
      </div>

      <div className="mt-4">
        <StageSelect
          id={lead.id}
          currentStage={lead.stage}
          stages={stages}
          onStageChange={onStageChange}
        />
      </div>
    </article>
  );
}

function DraggableLeadCard({
  lead,
  stages,
  onStageChange,
  onDeleted,
}: {
  lead: CrmLead;
  stages: string[];
  onStageChange: (nextStage: string) => void;
  onDeleted: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { stage: normalizeStage(lead.stage) },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div ref={setNodeRef} style={style}>
      <LeadCard
        lead={lead}
        stages={stages}
        dragHandle={{ ...attributes, ...listeners }}
        dragging={isDragging}
        onStageChange={onStageChange}
        onDeleted={onDeleted}
      />
    </div>
  );
}

function KanbanColumn({
  stage,
  leads,
  stages,
  onStageChange,
  onDeleted,
}: {
  stage: string;
  leads: CrmLead[];
  stages: string[];
  onStageChange: (leadId: string, nextStage: string) => void;
  onDeleted: (leadId: string) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: stage });

  return (
    <section
      ref={setNodeRef}
      className={`flex h-full min-h-0 w-[18rem] flex-col rounded-xl border bg-muted/20 transition-colors ${isOver ? "border-foreground/30 bg-muted/35" : "border-border"}`}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <StageBadge stage={stage} />
        <span className="rounded-full bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {leads.length}
        </span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
        {leads.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border bg-background/70 px-4 text-center text-xs text-muted-foreground">
            Drop a lead here.
          </div>
        ) : (
          leads.map((lead) => (
            <DraggableLeadCard
              key={lead.id}
              lead={lead}
              stages={stages}
              onStageChange={(nextStage) => onStageChange(lead.id, nextStage)}
              onDeleted={() => onDeleted(lead.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}

export function KanbanBoard({ initialLeads, stageOrder }: { initialLeads: CrmLead[]; stageOrder: string[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const toast = useToast();

  const stages = useMemo(() => {
    const base = stageOrder.map(normalizeStage);
    const extras = Array.from(new Set(leads.map((lead) => normalizeStage(lead.stage)).filter((stage) => !base.includes(stage))));
    return [...base, ...extras];
  }, [leads, stageOrder]);

  const stageColumns = useMemo(
    () => stages.map((stage) => ({
      stage,
      leads: leads.filter((lead) => normalizeStage(lead.stage) === stage),
    })),
    [leads, stages],
  );

  const activeLead = activeLeadId ? leads.find((lead) => lead.id === activeLeadId) ?? null : null;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function applyStageChange(leadId: string, nextStage: string) {
    setLeads((prev) => prev.map((lead) => (
      lead.id === leadId ? { ...lead, stage: nextStage } : lead
    )));
  }

  function persistStageChange(leadId: string, nextStage: string, previousStage: string) {
    startTransition(async () => {
      const result = await updateLeadStageAction(leadId, nextStage);
      if (result.error) {
        applyStageChange(leadId, previousStage);
        toast.error("Failed to update stage", result.error);
      }
    });
  }

  function handleStageChange(leadId: string, requestedStage: string) {
    const nextStage = normalizeStage(requestedStage);
    const currentLead = leads.find((lead) => lead.id === leadId);
    if (!currentLead) return;

    const previousStage = normalizeStage(currentLead.stage);
    if (previousStage === nextStage) return;

    applyStageChange(leadId, nextStage);
    persistStageChange(leadId, nextStage, previousStage);
  }

  function handleDeleted(leadId: string) {
    setLeads((prev) => prev.filter((lead) => lead.id !== leadId));
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveLeadId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveLeadId(null);

    if (!event.over) return;

    const leadId = String(event.active.id);
    const requestedStage = String(event.over.id);
    if (!stages.includes(requestedStage)) return;

    handleStageChange(leadId, requestedStage);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveLeadId(null)}
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden p-4">
        <div data-os-scroll="true" className="h-full overflow-x-auto overflow-y-hidden">
          <div className="grid h-full min-w-max gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
            {stageColumns.map((column) => (
              <KanbanColumn
                key={column.stage}
                stage={column.stage}
                leads={column.leads}
                stages={stages}
                onStageChange={handleStageChange}
                onDeleted={handleDeleted}
              />
            ))}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeLead ? (
          <div className="w-[18rem] rotate-1">
            <LeadCard
              lead={activeLead}
              stages={stages}
              onStageChange={() => undefined}
              onDeleted={() => undefined}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}