import { HiMiniCheckCircle, HiMiniExclamationTriangle, HiMiniArrowPath } from "react-icons/hi2";
import { ActionButton } from "./action-button";
import { PRICING_CONFIG } from "../_data/catalog";
import type { CatalogModule, CatalogStatus } from "../_data/catalog";

interface Props {
  module: CatalogModule;
  status: CatalogStatus;
  installedVersion: string | null;
}

const STATUS_BADGE: Record<CatalogStatus, { label: string; classes: string; icon?: React.ReactNode } | null> = {
  installed:    { label: "Installed",   classes: "border-green-200 bg-green-50 text-green-700", icon: <HiMiniCheckCircle className="h-3 w-3" /> },
  core:         { label: "Core",        classes: "border-border bg-muted text-muted-foreground", icon: <HiMiniCheckCircle className="h-3 w-3" /> },
  error:        { label: "Error",       classes: "border-rose-200 bg-rose-50 text-rose-700", icon: <HiMiniExclamationTriangle className="h-3 w-3" /> },
  in_progress:  { label: "Installing…", classes: "border-blue-200 bg-blue-50 text-blue-700", icon: <HiMiniArrowPath className="h-3 w-3 animate-spin" /> },
  available:    null,
  coming_soon:  null,
};

export function ModuleCard({ module: mod, status, installedVersion }: Props) {
  const pricing       = PRICING_CONFIG[mod.pricing];
  const statusBadge   = STATUS_BADGE[status];

  return (
    <div
      className={`flex flex-col rounded-lg border bg-background transition-shadow hover:shadow-sm ${
        status === "installed" || status === "core"
          ? "border-green-200"
          : status === "error"
            ? "border-rose-200"
            : "border-border"
      }`}
    >
      {/* Card body */}
      <div className="flex flex-1 flex-col p-5">
        {/* Top row: icon + badges */}
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-2xl">
            {mod.icon}
          </span>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {/* Status badge */}
            {statusBadge && (
              <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusBadge.classes}`}>
                {statusBadge.icon}
                {statusBadge.label}
              </span>
            )}
            {/* Pricing badge */}
            <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${pricing.classes}`}>
              {pricing.label}
            </span>
          </div>
        </div>

        {/* Title + description */}
        <div className="mt-3 flex-1">
          <h3 className="text-sm font-semibold text-foreground">{mod.title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-3">
            {mod.description}
          </p>
        </div>

        {/* Tags */}
        {mod.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {mod.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card footer */}
      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {mod.categoryLabel}
          </span>
          <span className="text-[10px] text-muted-foreground">
            v{installedVersion ?? mod.version}
            {mod.priceLabel && (
              <span className="ml-1.5 font-medium text-foreground">{mod.priceLabel}</span>
            )}
          </span>
        </div>

        <ActionButton
          name={mod.name}
          title={mod.title}
          status={status}
          pricing={mod.pricing}
          installable={mod.installable}
        />
      </div>
    </div>
  );
}
