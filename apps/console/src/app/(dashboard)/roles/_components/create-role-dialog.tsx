"use client";

import { useRef, useState, useTransition } from "react";
import { HiMiniXMark } from "react-icons/hi2";
import { createRoleAction } from "@sbc/module-iam/actions";
import { useToast } from "@/components/system-feedback";

export function CreateRoleDialog() {
  const [open, setOpen]            = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const toast   = useToast();

  function handleClose() {
    setOpen(false);
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createRoleAction(formData);
      if (result?.error) {
        toast.error("Failed to create role", result.error);
      } else {
        formRef.current?.reset();
        handleClose();
        toast.success("Role created", "The new role is ready to be assigned.");
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        + New Role
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

          <div className="relative z-10 flex w-full max-h-[92vh] flex-col rounded-t-lg border border-border bg-background shadow-xl sm:max-w-md sm:rounded-lg">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">New Role</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Define a role to group permissions.</p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <HiMiniXMark className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <form ref={formRef} id="create-role-form" action={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Identifier
                    <span className="ml-2 text-xs font-normal text-muted-foreground">lowercase, underscores only</span>
                  </label>
                  <input
                    name="name"
                    required
                    placeholder="crm_manager"
                    pattern="[a-z0-9_]+"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Display Name</label>
                  <input
                    name="label"
                    required
                    placeholder="CRM Manager"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-6 py-4">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md border border-input px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="create-role-form"
                disabled={pending}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {pending ? "Creating…" : "Create Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
