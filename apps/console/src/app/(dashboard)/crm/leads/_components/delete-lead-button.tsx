"use client";

import { useTransition } from "react";
import { HiMiniTrash } from "react-icons/hi2";
import { deleteLeadAction } from "@/actions/crm";
import { useToast, useConfirm } from "@/components/system-feedback";

export function DeleteLeadButton({ id, title }: { id: string; title: string }) {
  const [pending, startTransition] = useTransition();
  const toast   = useToast();
  const confirm = useConfirm();

  async function handle() {
    const ok = await confirm({
      title:        `Delete "${title}"?`,
      description:  "This will soft-delete the lead. Existing data is preserved.",
      confirmLabel: "Delete",
      tone:         "danger",
    });
    if (!ok) return;
    startTransition(async () => {
      const result = await deleteLeadAction(id);
      if (result.error) toast.error("Delete failed", result.error);
      else              toast.success("Lead deleted", `"${title}" has been removed.`);
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => void handle()}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 dark:hover:border-rose-400/30 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
      title="Delete lead"
    >
      <HiMiniTrash className="h-3.5 w-3.5" />
    </button>
  );
}
