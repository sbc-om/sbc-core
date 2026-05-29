"use client";

import { useTransition } from "react";
import { deleteRoleAction } from "@sbc/module-iam/actions";
import { useConfirm, useToast } from "@/components/system-feedback";

export function DeleteRoleButton({ id, isSystem }: { id: string; isSystem: boolean }) {
  const [pending, startTransition] = useTransition();
  const confirm = useConfirm();
  const toast = useToast();

  if (isSystem) return <span className="text-xs text-muted-foreground">System</span>;

  async function handleDelete() {
    const accepted = await confirm({
      title: "Delete role?",
      description: "This removes the role from the system. Users currently assigned to it will lose that access immediately.",
      confirmLabel: "Delete role",
      tone: "danger",
    });

    if (!accepted) return;

    startTransition(async () => {
      try {
        await deleteRoleAction(id);
        toast.success("Role deleted", "The role was removed successfully.");
      } catch (error) {
        toast.error("Delete failed", error instanceof Error ? error.message : "Unable to delete role.");
      }
    });
  }

  return (
    <button
      disabled={pending}
      onClick={() => void handleDelete()}
      className="text-xs text-destructive hover:underline disabled:opacity-50"
    >
      Delete
    </button>
  );
}
