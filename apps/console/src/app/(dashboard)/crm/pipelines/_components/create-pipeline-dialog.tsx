"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { HiMiniXMark } from "react-icons/hi2";
import { createPipelineAction } from "@/actions/crm";
import { useToast } from "@/components/system-feedback";

const DEFAULT_STAGES = "New, Qualified, Proposal, Negotiation, Won, Lost";

export function CreatePipelineDialog() {
  const [open, setOpen]            = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef                    = useRef<HTMLFormElement>(null);
  const toast                      = useToast();

  function handleClose() {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createPipelineAction(formData);
      if (result.error) {
        toast.error("Failed to create pipeline", result.error);
      } else {
        formRef.current?.reset();
        handleClose();
        toast.success("Pipeline created", "Your new pipeline is ready to use.");
      }
    });
  }

  const input = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground";
  const label = "mb-1.5 block text-sm font-medium text-foreground";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-md bg-foreground px-3 text-xs font-semibold text-background shadow-sm transition-opacity hover:opacity-90 sm:text-sm"
      >
        + New Pipeline
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto sm:items-center sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-pipeline-title"
            className="relative z-10 flex w-full max-h-[92vh] flex-col rounded-t-lg border border-border bg-background shadow-xl sm:max-w-lg sm:rounded-lg"
          >

            <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 id="create-pipeline-title" className="text-base font-semibold text-foreground">New Pipeline</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Define a sales pipeline and its stages.</p>
              </div>
              <button type="button" onClick={handleClose}
                aria-label="Close pipeline dialog"
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
                <HiMiniXMark className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <form ref={formRef} id="create-pipeline-form" action={handleSubmit} className="space-y-5">
                <div>
                  <label className={label}>Pipeline Name <span className="text-rose-500">*</span></label>
                  <input name="name" required placeholder="e.g. Enterprise Sales" className={input} />
                </div>

                <div>
                  <label className={label}>Stages <span className="text-rose-500">*</span></label>
                  <input
                    name="stages"
                    required
                    defaultValue={DEFAULT_STAGES}
                    placeholder="New, Qualified, Proposal, Won, Lost"
                    className={input}
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Comma-separated list of stage names, in order.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                  <p className="text-xs font-medium text-foreground">Preview</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {DEFAULT_STAGES.split(",").map((s, i, arr) => (
                      <span key={s}>
                        <span className="font-medium text-foreground">{s.trim()}</span>
                        {i < arr.length - 1 && <span className="mx-1.5 text-muted-foreground/40">→</span>}
                      </span>
                    ))}
                  </p>
                </div>
              </form>
            </div>

            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-6 py-4">
              <button type="button" onClick={handleClose}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
                Cancel
              </button>
              <button type="submit" form="create-pipeline-form" disabled={pending}
                className="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background shadow-sm hover:opacity-90 disabled:opacity-50">
                {pending ? "Creating…" : "Create Pipeline"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
