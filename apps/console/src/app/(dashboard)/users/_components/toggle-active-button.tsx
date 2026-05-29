"use client";

import { useTransition } from "react";
import { toggleUserActiveAction } from "@sbc/module-iam/actions";

export function ToggleActiveButton({ id, isActive }: { id: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => toggleUserActiveAction(id, !isActive))}
      className={`inline-block rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors disabled:opacity-50 ${
        isActive
          ? "border-border bg-muted text-foreground hover:bg-muted/80"
          : "border-border bg-background text-muted-foreground hover:bg-muted/60"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </button>
  );
}
