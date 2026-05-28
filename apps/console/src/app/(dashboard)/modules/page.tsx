import { db, modules } from "@sbc/database";
import { asc } from "drizzle-orm";
import { HiMiniCube, HiMiniSparkles } from "react-icons/hi2";

const stateColors: Record<string, string> = {
  installed:    "bg-green-100 text-green-800",
  installing:   "bg-blue-100 text-blue-800",
  to_install:   "bg-yellow-100 text-yellow-800",
  to_upgrade:   "bg-orange-100 text-orange-800",
  upgrading:    "bg-orange-100 text-orange-800",
  error:        "bg-red-100 text-red-800",
  uninstalled:  "bg-gray-100 text-gray-600",
  discovered:   "bg-gray-100 text-gray-600",
};

export default async function ModulesPage() {
  const rows = await db
    .select()
    .from(modules)
    .orderBy(asc(modules.name));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 rounded-[1.5rem] border border-border bg-background p-6">
        <div>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted text-slate-700">
            <HiMiniCube className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">Modules</h2>
          <p className="mt-2 text-sm text-slate-600">Install, upgrade, and manage platform modules with a clear view of lifecycle state.</p>
        </div>
        <div className="hidden items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm font-medium text-slate-600 sm:flex">
          <HiMiniSparkles className="h-4 w-4 text-slate-500" />
          Module registry
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.25rem] border border-border bg-background">
        {rows.length === 0 ? (
          <div className="p-6">
            <p className="text-sm text-muted-foreground">No modules registered yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Module</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Version</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Installed</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">State</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Installed At</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((mod) => (
                <tr key={mod.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{mod.title}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{mod.version}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{mod.installedVersion ?? "Not installed"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${stateColors[mod.state] ?? "bg-gray-100 text-gray-600"}`}>
                      {mod.state}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {mod.installedAt ? mod.installedAt.toLocaleString() : "Not available"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
