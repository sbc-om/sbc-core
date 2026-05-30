"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { HiMiniXMark } from "react-icons/hi2";
import { createLeadAction } from "@/actions/crm";
import { useToast } from "@/components/system-feedback";

const STAGES    = ["new", "qualified", "proposal", "negotiation", "won", "lost"] as const;
const PRIORITIES = ["low", "medium", "high"] as const;

export function CreateLeadDialog() {
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
      const result = await createLeadAction(formData);
      if (result.error) {
        toast.error("Failed to create lead", result.error);
      } else {
        formRef.current?.reset();
        handleClose();
        toast.success("Lead added", "The lead is now in your pipeline.");
      }
    });
  }

  const input = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground";
  const label = "mb-1.5 block text-sm font-medium text-foreground";
  const select = `${input} cursor-pointer`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background shadow-sm transition-opacity hover:opacity-90"
      >
        + New Lead
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto sm:items-center sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-lead-title"
            className="relative z-10 flex w-full max-h-[92vh] flex-col rounded-t-lg border border-border bg-background shadow-xl sm:max-w-lg sm:rounded-lg"
          >

            <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 id="create-lead-title" className="text-base font-semibold text-foreground">New Lead</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Add a sales opportunity to your pipeline.</p>
              </div>
              <button type="button" onClick={handleClose}
                aria-label="Close lead dialog"
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
                <HiMiniXMark className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <form ref={formRef} id="create-lead-form" action={handleSubmit} className="space-y-4">
                <div>
                  <label className={label}>Title <span className="text-rose-500">*</span></label>
                  <input name="title" required placeholder="Website redesign deal" className={input} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={label}>Value</label>
                    <input name="value" type="number" min="0" step="0.01" placeholder="25000" className={input} />
                  </div>
                  <div>
                    <label className={label}>Currency</label>
                    <select name="currency" defaultValue="USD" className={select}>
                      {["USD", "EUR", "GBP", "IRR", "AED"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={label}>Stage</label>
                    <select name="stage" defaultValue="new" className={select}>
                      {STAGES.map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={label}>Priority</label>
                    <select name="priority" defaultValue="medium" className={select}>
                      {PRIORITIES.map((p) => (
                        <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={label}>Notes</label>
                  <textarea name="notes" rows={3} placeholder="Key details about this opportunity…"
                    className={`${input} resize-none`} />
                </div>
              </form>
            </div>

            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-6 py-4">
              <button type="button" onClick={handleClose}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
                Cancel
              </button>
              <button type="submit" form="create-lead-form" disabled={pending}
                className="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background shadow-sm hover:opacity-90 disabled:opacity-50">
                {pending ? "Saving…" : "Create Lead"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
