import Link from "next/link";
import type { ReactNode } from "react";
import { HiMiniArrowLeft } from "react-icons/hi2";
import { DashboardPageHeader } from "@/components/dashboard-page-header";

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingsSectionShell({ title, children }: Props) {
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
        <DashboardPageHeader title={title} />
      </section>

      {children}
    </div>
  );
}
