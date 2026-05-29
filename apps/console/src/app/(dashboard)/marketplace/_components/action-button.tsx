"use client";

import { useTransition } from "react";
import {
  HiMiniArrowDownTray,
  HiMiniCheckCircle,
  HiMiniClock,
  HiMiniCpuChip,
  HiMiniTrash,
} from "react-icons/hi2";
import { installModuleAction, uninstallModuleAction } from "@/actions/modules";
import { useToast, useConfirm } from "@/components/system-feedback";
import type { CatalogStatus, Pricing } from "../_data/catalog";

interface Props {
  name:        string;
  title:       string;
  status:      CatalogStatus;
  pricing:     Pricing;
  installable: boolean;
}

export function ActionButton({ name, title, status, pricing, installable }: Props) {
  const [pending, startTransition] = useTransition();
  const toast   = useToast();
  const confirm = useConfirm();

  function handleInstall() {
    startTransition(async () => {
      const result = await installModuleAction(name);
      if (result.error) toast.error("Install failed", result.error);
      else              toast.success(`${title} installed`, "The module is now active.");
    });
  }

  async function handleUninstall() {
    const ok = await confirm({
      title:        `Uninstall ${title}?`,
      description:  "Removes all menus and permissions registered by this module. Existing data is preserved.",
      confirmLabel: "Uninstall",
      tone:         "danger",
    });
    if (!ok) return;
    startTransition(async () => {
      const result = await uninstallModuleAction(name);
      if (result.error) toast.error("Uninstall failed", result.error);
      else              toast.success(`${title} removed`, "The module has been uninstalled.");
    });
  }

  const base = "inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border px-3 text-xs font-semibold transition-colors disabled:opacity-50";

  if (status === "core") {
    return (
      <span className={`${base} cursor-default border-border bg-muted text-muted-foreground`}>
        <HiMiniCpuChip className="h-3.5 w-3.5" />
        Core
      </span>
    );
  }

  if (status === "installed") {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => void handleUninstall()}
        className={`${base} border-rose-300/40 bg-rose-500/5 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400`}
      >
        <HiMiniTrash className="h-3.5 w-3.5" />
        {pending ? "Removing…" : "Uninstall"}
      </button>
    );
  }

  if (status === "in_progress") {
    return (
      <span className={`${base} cursor-default border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-300`}>
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-sky-300 border-t-sky-600 dark:border-sky-300/30 dark:border-t-sky-300" />
        Processing
      </span>
    );
  }

  if (status === "error") {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={handleInstall}
        className={`${base} border-rose-300/40 bg-rose-500/5 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400`}
      >
        {pending ? "Retrying…" : "Retry"}
      </button>
    );
  }

  // Not installable yet (coming soon)
  if (!installable) {
    return (
      <span className={`${base} cursor-default border-border bg-muted/70 text-muted-foreground`}>
        <HiMiniClock className="h-3.5 w-3.5" />
        Coming Soon
      </span>
    );
  }

  // Available — installable
  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleInstall}
      className={`${base} border-foreground bg-foreground text-background shadow-sm hover:opacity-92`}
    >
      <HiMiniArrowDownTray className="h-3.5 w-3.5" />
      {pending ? "Installing…" : "Install"}
    </button>
  );
}
