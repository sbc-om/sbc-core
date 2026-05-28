"use client";

import { useTransition } from "react";
import { deleteRoleAction } from "@sbc/module-iam/actions";

export function DeleteRoleButton({ id, isSystem }: { id: string; isSystem: boolean }) {
  const [pending, startTransition] = useTransition();

  if (isSystem) return <span className="text-xs text-muted-foreground">System</span>;

  return (
    <button
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this role? Users will lose it.")) return;
        startTransition(() => deleteRoleAction(id));
      }}
      className="text-xs text-destructive hover:underline disabled:opacity-50"
    >
      Delete
    </button>
  );
}
