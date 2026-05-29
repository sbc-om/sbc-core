"use client";

import { useRef, useState, useTransition } from "react";
import { HiMiniXMark } from "react-icons/hi2";
import { createContactAction } from "@sbc/module-contacts/actions";
import { useToast } from "@/components/system-feedback";

export function CreateContactDialog() {
  const [open, setOpen]            = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const toast   = useToast();

  function handleClose() { setOpen(false); }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createContactAction(formData);
      if (result.error) {
        toast.error("Failed to create contact", result.error);
      } else {
        formRef.current?.reset();
        handleClose();
        toast.success("Contact added", "The contact is now in your list.");
      }
    });
  }

  const inputCls = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground";
  const labelCls = "mb-1.5 block text-sm font-medium text-foreground";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        + New Contact
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

          <div className="relative z-10 flex w-full max-h-[92vh] flex-col rounded-t-lg border border-border bg-background shadow-xl sm:max-w-lg sm:rounded-lg">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">New Contact</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Add a person or organization to your contacts.</p>
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
              <form ref={formRef} id="create-contact-form" action={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>First Name <span className="text-rose-500">*</span></label>
                    <input name="firstName" required placeholder="Jane" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Last Name</label>
                    <input name="lastName" placeholder="Smith" className={inputCls} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Email</label>
                    <input name="email" type="email" placeholder="jane@example.com" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Phone</label>
                    <input name="phone" type="tel" placeholder="+1 555 000 0000" className={inputCls} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Company</label>
                    <input name="company" placeholder="Acme Inc." className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Job Title</label>
                    <input name="jobTitle" placeholder="Product Manager" className={inputCls} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>City</label>
                    <input name="city" placeholder="San Francisco" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Country</label>
                    <input name="country" placeholder="United States" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Notes</label>
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="Any additional notes…"
                    className={`${inputCls} resize-none`}
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
                form="create-contact-form"
                disabled={pending}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {pending ? "Saving…" : "Create Contact"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
