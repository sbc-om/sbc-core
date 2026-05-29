"use client";

import { useRef, useState, useTransition } from "react";
import { HiMiniXMark } from "react-icons/hi2";
import { createCustomerAction } from "@/actions/crm";
import { useToast } from "@/components/system-feedback";

export function CreateCustomerDialog() {
  const [open, setOpen]            = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef                    = useRef<HTMLFormElement>(null);
  const toast                      = useToast();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createCustomerAction(formData);
      if (result.error) {
        toast.error("Failed to create customer", result.error);
      } else {
        formRef.current?.reset();
        setOpen(false);
        toast.success("Customer added", "The customer is now in your CRM.");
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
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background shadow-sm transition-opacity hover:opacity-90"
      >
        + New Customer
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 flex w-full max-h-[92vh] flex-col rounded-t-lg border border-border bg-background shadow-xl sm:max-w-lg sm:rounded-lg">

            <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">New Customer</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Add a customer to your CRM.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
                <HiMiniXMark className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <form ref={formRef} id="create-customer-form" action={handleSubmit} className="space-y-4">
                <div>
                  <label className={label}>Name <span className="text-rose-500">*</span></label>
                  <input name="name" required placeholder="Acme Corporation" className={input} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={label}>Email</label>
                    <input name="email" type="email" placeholder="contact@acme.com" className={input} />
                  </div>
                  <div>
                    <label className={label}>Phone</label>
                    <input name="phone" type="tel" placeholder="+1 555 000 0000" className={input} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={label}>Company</label>
                    <input name="company" placeholder="Acme Inc." className={input} />
                  </div>
                  <div>
                    <label className={label}>Job Title</label>
                    <input name="jobTitle" placeholder="CEO" className={input} />
                  </div>
                </div>
                <div>
                  <label className={label}>Notes</label>
                  <textarea name="notes" rows={3} placeholder="Any notes…" className={`${input} resize-none`} />
                </div>
              </form>
            </div>

            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-6 py-4">
              <button type="button" onClick={() => setOpen(false)}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
                Cancel
              </button>
              <button type="submit" form="create-customer-form" disabled={pending}
                className="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background shadow-sm hover:opacity-90 disabled:opacity-50">
                {pending ? "Saving…" : "Create Customer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
