"use client";

import { useState } from "react";
import { HiMiniCheck, HiMiniChevronDown } from "react-icons/hi2";
import { cn } from "@sbc/ui";
import { useTheme } from "./theme-provider";

interface Props {
  compact?: boolean;
}

const OPTIONS = [
  {
    id: "light",
    label: "Light",
    description: "Bright surfaces for everyday work.",
  },
  {
    id: "dark",
    label: "Dark",
    description: "Low-glare contrast for focused sessions.",
  },
] as const;

export function ThemeToggle({ compact = false }: Props) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const activeOption = OPTIONS.find((option) => option.id === theme) ?? OPTIONS[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Select theme"
        className={cn(
          "inline-flex items-center gap-2 rounded-md border border-border bg-background text-foreground shadow-sm transition-colors hover:bg-muted",
          compact ? "h-9 px-3" : "h-10 px-3.5",
        )}
      >
        <span className="text-sm font-medium text-foreground">{compact ? theme.toUpperCase() : activeOption.label}</span>
        <HiMiniChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close theme menu"
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-background p-1.5 shadow-lg">
            <div className="px-2 pb-2 pt-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Theme</p>
              <p className="mt-1 text-xs text-muted-foreground">Choose the interface appearance.</p>
            </div>

            <div className="space-y-1">
              {OPTIONS.map((option) => {
                const active = option.id === theme;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setTheme(option.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-muted",
                      active && "bg-muted",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-foreground">{option.label}</span>
                      <span className="block text-xs text-muted-foreground">{option.description}</span>
                    </span>
                    <span className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
                      active ? "border-foreground bg-foreground text-background" : "border-border text-transparent",
                    )}>
                      <HiMiniCheck className="h-3 w-3" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
