"use client";

import { useTransition } from "react";
import { HiMiniTrash } from "react-icons/hi2";
import { deleteContactAction } from "@sbc/module-contacts/actions";
import { useConfirm, useToast } from "@/components/system-feedback";

export function DeleteContactButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();
  const confirm = useConfirm();
  const toast   = useToast();

  async function handle() {
    const ok = await confirm({
      title:        `Delete "${name}"?`,
      description:  "This contact will be permanently removed from your list.",
      confirmLabel: "Delete",
      tone:         "danger",
    });
    if (!ok) return;
    startTransition(async () => {
      const result = await deleteContactAction(id);
      if (result.error) toast.error("Delete failed", result.error);
      else              toast.success("Contact deleted", `${name} was removed.`);
    });
  }

  return (
    <button
      disabled={pending}
      onClick={() => void handle()}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
      title="Delete contact"
    >
      <HiMiniTrash className="h-3.5 w-3.5" />
    </button>
  );
}
