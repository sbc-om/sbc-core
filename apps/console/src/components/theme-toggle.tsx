"use client";

import { useState } from "react";
import { HiMiniCheck, HiMiniChevronDown, HiMiniMoon, HiMiniSun } from "react-icons/hi2";
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
  const ActiveIcon = theme === "dark" ? HiMiniMoon : HiMiniSun;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Select theme"
        className={cn(
          "inline-flex h-10 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-foreground shadow-sm transition-colors hover:bg-muted",
          !compact && "px-3",
        )}
      >
        <span className="flex h-7 w-7 items-center justify-center text-foreground">
          <ActiveIcon className="h-4 w-4" />
        </span>
        {!compact && <span className="text-sm font-medium text-foreground">{activeOption.label}</span>}
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
          <div className="absolute right-0 top-full z-40 mt-2 w-44 overflow-hidden rounded-lg border border-border bg-background p-1.5 shadow-lg">
            <div className="space-y-1">
              {OPTIONS.map((option) => {
                const active = option.id === theme;
                const OptionIcon = option.id === "dark" ? HiMiniMoon : HiMiniSun;

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
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center text-foreground">
                      <OptionIcon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-medium text-foreground">{option.label}</span>
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
