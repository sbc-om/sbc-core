import Link from "next/link";
import type { CSSProperties } from "react";
import { db, settings } from "@sbc/database";
import { asc } from "drizzle-orm";
import type { IconType } from "react-icons";
import {
  HiMiniCog6Tooth,
  HiMiniDocumentText,
  HiMiniLockClosed,
  HiMiniPaintBrush,
  HiMiniSquares2X2,
  HiMiniUser,
  HiMiniUserGroup,
  HiMiniUsers,
} from "react-icons/hi2";
import { cn } from "@sbc/ui";
import { getSessionUser } from "@/lib/session";

interface SettingsCard {
  id: string;
  title: string;
  group: string;
  icon: IconType;
  href: string;
  badge?: string;
  iconClassName: string;
  iconStyle: CSSProperties;
}

export default async function SettingsPage() {
  const [user, rows] = await Promise.all([
    getSessionUser(),
    db
      .select({ module: settings.module })
      .from(settings)
      .orderBy(asc(settings.module)),
  ]);

  const moduleCount = new Set(rows.map((row) => row.module ?? "core")).size;

  const settingsCards: SettingsCard[] = [
    {
      id: "profile",
      title: "Profile",
      group: "Account",
      icon: HiMiniUser,
      href: user ? `/users/${user.id}` : "/users",
      iconClassName: "text-blue-600",
      iconStyle: {
        "--settings-icon-bg-light": "oklch(0.97 0.02 249)",
        "--settings-icon-bg-dark": "oklch(0.29 0.04 249 / 0.42)",
        "--settings-icon-ring-light": "oklch(0.9 0.03 249)",
        "--settings-icon-ring-dark": "oklch(0.45 0.05 249 / 0.72)",
      } as CSSProperties,
    },
    {
      id: "security",
      title: "Security",
      group: "Account",
      icon: HiMiniLockClosed,
      href: user ? `/users/${user.id}` : "/users",
      iconClassName: "text-rose-600",
      iconStyle: {
        "--settings-icon-bg-light": "oklch(0.97 0.025 18)",
        "--settings-icon-bg-dark": "oklch(0.31 0.055 18 / 0.38)",
        "--settings-icon-ring-light": "oklch(0.9 0.03 18)",
        "--settings-icon-ring-dark": "oklch(0.5 0.06 18 / 0.72)",
      } as CSSProperties,
    },
    {
      id: "appearance",
      title: "Appearance",
      group: "Account",
      icon: HiMiniPaintBrush,
      href: "/settings/appearance",
      iconClassName: "text-violet-600",
      iconStyle: {
        "--settings-icon-bg-light": "oklch(0.97 0.02 310)",
        "--settings-icon-bg-dark": "oklch(0.3 0.05 310 / 0.36)",
        "--settings-icon-ring-light": "oklch(0.91 0.025 310)",
        "--settings-icon-ring-dark": "oklch(0.47 0.06 310 / 0.72)",
      } as CSSProperties,
    },
    {
      id: "operation",
      title: "Operation",
      group: "Operations",
      icon: HiMiniCog6Tooth,
      href: "/settings/operation",
      badge: `${moduleCount} modules`,
      iconClassName: "text-cyan-600",
      iconStyle: {
        "--settings-icon-bg-light": "oklch(0.97 0.02 210)",
        "--settings-icon-bg-dark": "oklch(0.29 0.04 210 / 0.38)",
        "--settings-icon-ring-light": "oklch(0.9 0.025 210)",
        "--settings-icon-ring-dark": "oklch(0.46 0.05 210 / 0.72)",
      } as CSSProperties,
    },
    {
      id: "sales",
      title: "Sales",
      group: "Operations",
      icon: HiMiniUsers,
      href: "/contacts",
      iconClassName: "text-orange-600",
      iconStyle: {
        "--settings-icon-bg-light": "oklch(0.97 0.02 55)",
        "--settings-icon-bg-dark": "oklch(0.31 0.045 55 / 0.36)",
        "--settings-icon-ring-light": "oklch(0.91 0.025 55)",
        "--settings-icon-ring-dark": "oklch(0.49 0.05 55 / 0.72)",
      } as CSSProperties,
    },
    {
      id: "hr",
      title: "HR",
      group: "Operations",
      icon: HiMiniUserGroup,
      href: "/users",
      iconClassName: "text-blue-500",
      iconStyle: {
        "--settings-icon-bg-light": "oklch(0.97 0.02 240)",
        "--settings-icon-bg-dark": "oklch(0.29 0.045 240 / 0.38)",
        "--settings-icon-ring-light": "oklch(0.9 0.025 240)",
        "--settings-icon-ring-dark": "oklch(0.47 0.055 240 / 0.72)",
      } as CSSProperties,
    },
    {
      id: "documents",
      title: "Documents",
      group: "Operations",
      icon: HiMiniDocumentText,
      href: "/files",
      iconClassName: "text-fuchsia-600",
      iconStyle: {
        "--settings-icon-bg-light": "oklch(0.97 0.025 335)",
        "--settings-icon-bg-dark": "oklch(0.31 0.05 335 / 0.36)",
        "--settings-icon-ring-light": "oklch(0.91 0.03 335)",
        "--settings-icon-ring-dark": "oklch(0.49 0.06 335 / 0.72)",
      } as CSSProperties,
    },
    {
      id: "widgets",
      title: "Widgets",
      group: "Operations",
      icon: HiMiniSquares2X2,
      href: "/settings/widgets",
      iconClassName: "text-violet-600",
      iconStyle: {
        "--settings-icon-bg-light": "oklch(0.97 0.02 305)",
        "--settings-icon-bg-dark": "oklch(0.3 0.05 305 / 0.36)",
        "--settings-icon-ring-light": "oklch(0.91 0.025 305)",
        "--settings-icon-ring-dark": "oklch(0.48 0.06 305 / 0.72)",
      } as CSSProperties,
    },
  ];

  const groupedCards = Array.from(
    settingsCards.reduce((acc, card) => {
      const current = acc.get(card.group) ?? [];
      current.push(card);
      acc.set(card.group, current);
      return acc;
    }, new Map<string, SettingsCard[]>()),
  );

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-border/70 bg-background px-6 py-5 shadow-sm lg:px-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            A minimal control surface for account and operational preferences.
          </p>
        </div>
      </section>

      {groupedCards.map(([group, cards]) => (
        <section key={group} className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-foreground">{group}</h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <Link
                  key={card.id}
                  href={card.href}
                  className={cn("group flex min-h-32 flex-col rounded-lg border border-border/70 bg-background p-5 shadow-sm transition-colors hover:border-foreground/15 hover:bg-muted/10")}
                >
                  <div className="flex flex-col items-start gap-4">
                    <span
                      className="settings-icon-chip flex h-12 w-12 shrink-0 items-center justify-center rounded-md transition-colors"
                      style={card.iconStyle}
                    >
                      <Icon className={cn("h-5 w-5", card.iconClassName)} />
                    </span>
                    <div className="space-y-2">
                      <p className="text-base font-semibold text-foreground">{card.title}</p>
                      {card.badge && (
                        <span className="inline-flex rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          {card.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
