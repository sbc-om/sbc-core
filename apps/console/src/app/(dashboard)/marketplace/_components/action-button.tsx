"use client";

import { useTransition } from "react";
import { HiMiniArrowDownTray, HiMiniArrowUpTray, HiMiniLockClosed, HiMiniCheckCircle } from "react-icons/hi2";
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
      if (result.error) {
        toast.error("Install failed", result.error);
      } else {
        toast.success(`${title} installed`, "The module is now active.");
      }
    });
  }

  async function handleUninstall() {
    const ok = await confirm({
      title: `Uninstall ${title}?`,
      description: "This removes all menus and permissions registered by this module. Existing data is preserved unless you explicitly remove it.",
      confirmLabel: "Uninstall",
      tone: "danger",
    });
    if (!ok) return;

    startTransition(async () => {
      const result = await uninstallModuleAction(name);
      if (result.error) {
        toast.error("Uninstall failed", result.error);
      } else {
        toast.success(`${title} uninstalled`, "The module has been removed.");
      }
    });
  }

  // Core modules — cannot be uninstalled
  if (status === "core") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
        <HiMiniCheckCircle className="h-3.5 w-3.5" />
        Core
      </span>
    );
  }

  // Installed
  if (status === "installed") {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => void handleUninstall()}
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100 disabled:opacity-50"
      >
        <HiMiniArrowUpTray className="h-3.5 w-3.5" />
        {pending ? "Removing…" : "Uninstall"}
      </button>
    );
  }

  // In progress
  if (status === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
        Processing…
      </span>
    );
  }

  // Error
  if (status === "error") {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={handleInstall}
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100 disabled:opacity-50"
      >
        {pending ? "Retrying…" : "Retry"}
      </button>
    );
  }

  // Coming soon — not installable yet
  if (!installable) {
    if (pricing === "pro" || pricing === "enterprise") {
      return (
        <button
          type="button"
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground"
          disabled
        >
          <HiMiniLockClosed className="h-3.5 w-3.5" />
          Coming Soon
        </button>
      );
    }
    return (
      <span className="rounded-md border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
        Coming Soon
      </span>
    );
  }

  // Available — can be installed
  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleInstall}
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
    >
      <HiMiniArrowDownTray className="h-3.5 w-3.5" />
      {pending ? "Installing…" : "Install"}
    </button>
  );
}
