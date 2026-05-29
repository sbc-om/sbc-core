import { HiMiniBolt, HiMiniCube, HiMiniShieldCheck, HiMiniUsers } from "react-icons/hi2";
import type { IconType } from "react-icons";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Platform overview and activity summary.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Installed Modules" value="0" description="Active modules" icon={HiMiniCube} />
        <StatCard title="Active Users"       value="0" description="Platform users"  icon={HiMiniUsers} />
        <StatCard title="Pending Events"     value="0" description="Event queue"     icon={HiMiniBolt} />
        <StatCard title="Audit Entries"      value="0" description="Last 24 hours"   icon={HiMiniShieldCheck} />
      </div>

      <div className="rounded-lg border border-border bg-background p-6">
        <h2 className="mb-1 text-sm font-semibold text-foreground">Getting started</h2>
        <p className="text-sm text-muted-foreground">
          Install modules, configure roles, and invite users to start using the platform.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title:       string;
  value:       string;
  description: string;
  icon:        IconType;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
