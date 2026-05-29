"use client";

import { useTransition } from "react";
import { toggleUserActiveAction } from "@sbc/module-iam/actions";

export function ToggleActiveButton({ id, isActive }: { id: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => toggleUserActiveAction(id, !isActive))}
      className={`inline-block rounded border px-2 py-0.5 text-xs font-medium transition-colors disabled:opacity-50 ${
        isActive
          ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
          : "border-border bg-muted text-muted-foreground hover:bg-muted/70"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </button>
  );
}
