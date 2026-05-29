"use client";

import { useTransition } from "react";
import { HiMiniArrowPath } from "react-icons/hi2";
import { syncCoreMenusAction } from "@/actions/sync-menus";
import { useToast } from "@/components/system-feedback";

export function SyncMenusButton() {
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  function handle() {
    startTransition(async () => {
      const result = await syncCoreMenusAction();
      if (result.error) {
        toast.error("Sync failed", result.error);
      } else {
        toast.success("Menus synced", "Reloading to apply changes…");
        window.location.reload();
      }
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handle}
      title="Re-register all core module menus and permissions"
      className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md border border-border bg-background px-3.5 text-sm font-semibold text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
    >
      <HiMiniArrowPath className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} />
      {pending ? "Syncing…" : "Sync Menus"}
    </button>
  );
}
