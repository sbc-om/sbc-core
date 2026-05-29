"use client";

import { HiMiniCheck, HiMiniMoon, HiMiniSun } from "react-icons/hi2";
import { cn } from "@sbc/ui";
import { useTheme } from "@/components/theme-provider";

const OPTIONS = [
  {
    id: "light",
    label: "Light",
    description: "Clean surfaces and soft contrast for daily work.",
    icon: HiMiniSun,
    iconClassName: "text-amber-600",
    iconWrapClassName: "bg-amber-50 ring-1 ring-amber-100",
  },
  {
    id: "dark",
    label: "Dark",
    description: "Focused dark surfaces for long sessions and lower glare.",
    icon: HiMiniMoon,
    iconClassName: "text-indigo-200",
    iconWrapClassName: "bg-slate-800 ring-1 ring-slate-700",
  },
] as const;

export function ThemeAppearancePanel() {
  const { theme, setTheme } = useTheme();

  return (
    <section className="app-surface space-y-5 p-6 lg:p-8">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-foreground">Appearance</h2>
        <p className="text-sm text-muted-foreground">
          Control the application theme globally. Your choice applies immediately across the console.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const active = theme === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setTheme(option.id)}
              className={cn(
                "app-surface app-surface-interactive flex items-start justify-between p-5 text-left",
                active && "border-foreground/20 bg-muted/10",
              )}
            >
              <div className="space-y-4">
                <span className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-md",
                  option.iconWrapClassName,
                )}>
                  <Icon className={cn("h-5 w-5", option.iconClassName)} />
                </span>
                <div className="space-y-1.5">
                  <p className="text-base font-semibold text-foreground">{option.label}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{option.description}</p>
                </div>
              </div>

              <span className={cn(
                "mt-1 flex h-6 w-6 items-center justify-center rounded-full border",
                active ? "border-foreground bg-foreground text-background" : "border-border text-transparent",
              )}>
                <HiMiniCheck className="h-3.5 w-3.5" />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
