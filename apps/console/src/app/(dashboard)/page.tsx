import { FaArrowTrendUp } from "react-icons/fa6";
import { HiMiniBolt, HiMiniCube, HiMiniShieldCheck, HiMiniUsers } from "react-icons/hi2";
import type { IconType } from "react-icons";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="rounded-[1.5rem] border border-border bg-background p-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Today</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Dashboard</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Run your team and daily work from here.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatusCard title="Installed Modules" value="0" description="Active business modules" icon={HiMiniCube} />
        <StatusCard title="Active Users" value="0" description="Across all tenants" icon={HiMiniUsers} />
        <StatusCard title="Pending Events" value="0" description="In the event queue" icon={HiMiniBolt} />
        <StatusCard title="Audit Entries" value="0" description="Last 24 hours" icon={HiMiniShieldCheck} />
      </div>
    </div>
  );
}

function StatusCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: IconType;
}) {
  return (
    <div className="rounded-[1.25rem] border border-border bg-background p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted text-slate-700">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{description}</p>
    </div>
  );
}
