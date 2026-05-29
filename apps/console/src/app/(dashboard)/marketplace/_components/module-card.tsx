import type { ComponentType } from "react";
import {
  HiMiniArrowPath,
  HiMiniBanknotes,
  HiMiniBriefcase,
  HiMiniCheckCircle,
  HiMiniCog6Tooth,
  HiMiniCpuChip,
  HiMiniExclamationCircle,
  HiMiniFolderOpen,
  HiMiniIdentification,
  HiMiniLockClosed,
  HiMiniPhone,
  HiMiniShieldCheck,
  HiMiniSparkles,
  HiMiniSquaresPlus,
  HiMiniUserGroup,
} from "react-icons/hi2";
import { ActionButton } from "./action-button";
import type { CatalogModule, CatalogStatus, Pricing } from "../_data/catalog";

// ── Icon registry ────────────────────────────────────────────────────────────
const MODULE_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  cpu:            HiMiniCpuChip,
  lock:           HiMiniLockClosed,
  folder:         HiMiniFolderOpen,
  identification: HiMiniIdentification,
  users:          HiMiniUserGroup,
  briefcase:      HiMiniBriefcase,
  banknotes:      HiMiniBanknotes,
  shield:         HiMiniShieldCheck,
  workflow:       HiMiniSquaresPlus,
  phone:          HiMiniPhone,
  sparkles:       HiMiniSparkles,
  cog:            HiMiniCog6Tooth,
};

// ── Pricing config ────────────────────────────────────────────────────────────
const PRICING: Record<Pricing, { label: string; fg: string; bg: string; border: string }> = {
  free:       { label: "Free",       fg: "text-foreground",      bg: "bg-muted/70",         border: "border-border" },
  pro:        { label: "Pro",        fg: "text-sky-700 dark:text-sky-300",    bg: "bg-sky-50 dark:bg-sky-500/10",     border: "border-sky-200 dark:border-sky-400/20" },
  enterprise: { label: "Enterprise", fg: "text-violet-700 dark:text-violet-300",  bg: "bg-violet-50 dark:bg-violet-500/10",   border: "border-violet-200 dark:border-violet-400/20" },
};

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS: Record<CatalogStatus, {
  label:  string;
  fg:     string;
  bg:     string;
  border: string;
  icon:   ComponentType<{ className?: string }>;
} | null> = {
  installed:   { label: "Installed",   fg: "text-foreground", bg: "bg-muted/70", border: "border-border", icon: HiMiniCheckCircle   },
  core:        { label: "Core",        fg: "text-muted-foreground",   bg: "bg-muted/70",  border: "border-border",   icon: HiMiniCpuChip       },
  in_progress: { label: "Installing",  fg: "text-sky-700 dark:text-sky-300",    bg: "bg-sky-50 dark:bg-sky-500/10",    border: "border-sky-200 dark:border-sky-400/20",    icon: HiMiniArrowPath      },
  error:       { label: "Error",       fg: "text-rose-700 dark:text-rose-300",    bg: "bg-rose-50 dark:bg-rose-500/10",    border: "border-rose-200 dark:border-rose-400/20",    icon: HiMiniExclamationCircle },
  available:   null,
  coming_soon: null,
};

interface Props {
  module:           CatalogModule;
  status:           CatalogStatus;
  installedVersion: string | null;
}

export function ModuleCard({ module: mod, status, installedVersion }: Props) {
  const Icon         = MODULE_ICONS[mod.icon] ?? HiMiniCog6Tooth;
  const pricing      = PRICING[mod.pricing];
  const statusCfg    = STATUS[status];
  const isActive     = status === "installed" || status === "core";
  const isComingSoon = status === "coming_soon";

  return (
    <div
      className={[
        "group flex flex-col overflow-hidden rounded-lg border border-border bg-background transition-all duration-150",
        isActive ? "shadow-sm" : "",
        status === "error" ? "border-rose-200/80 dark:border-rose-400/20" : "",
        !isActive && status !== "error" ? "hover:border-foreground/15 hover:shadow-sm" : "",
        isComingSoon       ? "opacity-75"                                          : "",
      ].filter(Boolean).join(" ")}
    >

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">

        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          {/* Icon */}
          <div
            className={[
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-md border",
              isActive
                ? "border-border bg-muted/70 text-foreground"
                : "border-border bg-muted text-muted-foreground group-hover:border-foreground/15",
            ].join(" ")}
          >
            <Icon className="h-5 w-5" />
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-start justify-end gap-1.5">
            {statusCfg && (
              <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusCfg.fg} ${statusCfg.bg} ${statusCfg.border}`}>
                <statusCfg.icon className={`h-3 w-3 ${status === "in_progress" ? "animate-spin" : ""}`} />
                {statusCfg.label}
              </span>
            )}
            <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${pricing.fg} ${pricing.bg} ${pricing.border}`}>
              {pricing.label}
            </span>
          </div>
        </div>

        {/* Title + category */}
        <div className="mt-3">
          <h3 className={`text-sm font-semibold leading-snug ${isComingSoon ? "text-muted-foreground" : "text-foreground"}`}>
            {mod.title}
          </h3>
          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
            {mod.categoryLabel}
          </p>
        </div>

        {/* Description */}
        <p className={`mt-2 flex-1 text-xs leading-relaxed line-clamp-2 ${isComingSoon ? "text-muted-foreground/60" : "text-muted-foreground"}`}>
          {mod.description}
        </p>

        {/* Tags */}
        {mod.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
            {mod.tags.slice(0, 4).map((tag, i) => (
              <span key={tag} className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
                {i > 0 && <span className="h-2.5 w-px bg-border" />}
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border bg-muted/20 px-5 py-3">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[10px] text-muted-foreground/60">
            v{installedVersion ?? mod.version}
          </span>
          {mod.priceLabel && (
            <span className="text-[11px] font-semibold text-foreground">
              {mod.priceLabel}
            </span>
          )}
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
