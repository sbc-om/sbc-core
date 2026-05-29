"use client";

import { HiMiniMoon, HiMiniSun } from "react-icons/hi2";
import { cn } from "@sbc/ui";
import { useTheme } from "./theme-provider";

interface Props {
  compact?: boolean;
}

export function ThemeToggle({ compact = false }: Props) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-border bg-background text-foreground transition-colors hover:bg-muted",
        compact ? "h-9 px-2.5" : "h-10 px-3.5",
      )}
    >
      <span className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md",
        isDark ? "bg-slate-800 text-amber-300" : "bg-amber-50 text-amber-600",
      )}>
        {isDark ? <HiMiniMoon className="h-4 w-4" /> : <HiMiniSun className="h-4 w-4" />}
      </span>
      {!compact && (
        <span className="text-sm font-medium">
          {isDark ? "Dark" : "Light"}
        </span>
      )}
    </button>
  );
}
