"use client";

import { useRef, useState, useTransition } from "react";
import { createRoleAction } from "@sbc/module-iam/actions";
import { useToast } from "@/components/system-feedback";

export function CreateRoleDialog() {
  const [open, setOpen]            = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useToast();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createRoleAction(formData);
      if (result?.error) {
        toast.error("Role creation failed", result.error);
      } else {
        formRef.current?.reset();
        setOpen(false);
        toast.success("Role created", "The new role is ready to be assigned.");
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        + New Role
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">Create Role</h2>

            <form ref={formRef} action={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Role Name <span className="text-muted-foreground font-normal text-xs">(lowercase, underscore)</span></label>
                <input
                  name="name"
                  required
                  placeholder="crm_manager"
                  pattern="[a-z0-9_]+"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Display Label</label>
                <input
                  name="label"
                  required
                  placeholder="CRM Manager"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-input px-4 py-2 text-sm hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {pending ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
