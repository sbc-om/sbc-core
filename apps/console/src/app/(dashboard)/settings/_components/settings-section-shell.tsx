import Link from "next/link";
import type { ReactNode } from "react";
import { HiMiniArrowLeft } from "react-icons/hi2";

interface Props {
  title: string;
  description: string;
  children: ReactNode;
}

export function SettingsSectionShell({ title, description, children }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <HiMiniArrowLeft className="h-4 w-4" />
          Settings
        </Link>
      </div>

      <section className="app-page-header">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </section>

      {children}
    </div>
  );
}
