"use client";

import { useTransition } from "react";

interface Props {
  email: string;
  action(formData: FormData): Promise<void>;
}

export function SecuritySettingsForm({ email, action }: Props) {
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    startTransition(async () => {
      await action(formData);
    });
  }

  return (
    <form action={submit} className="space-y-5">
      <div className="rounded-lg border border-border/70 bg-muted/20 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Account email</p>
        <p className="mt-1 text-sm font-medium text-foreground">{email}</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">New Password</label>
        <input
          name="password"
          type="password"
          minLength={8}
          required
          placeholder="Enter a new password"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
        <p className="mt-1 text-xs text-muted-foreground">Use at least 8 characters.</p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {pending ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
