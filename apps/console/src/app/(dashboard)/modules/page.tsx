import { db, modules } from "@sbc/database";
import { asc } from "drizzle-orm";
import { HiMiniCube } from "react-icons/hi2";
import { SyncMenusButton } from "@/components/sync-menus-button";

const stateConfig: Record<string, { label: string; classes: string }> = {
  installed:   { label: "Installed",   classes: "border-green-200 bg-green-50 text-green-700" },
  installing:  { label: "Installing",  classes: "border-blue-200 bg-blue-50 text-blue-700" },
  to_install:  { label: "Queued",      classes: "border-yellow-200 bg-yellow-50 text-yellow-700" },
  to_upgrade:  { label: "Upgrade",     classes: "border-orange-200 bg-orange-50 text-orange-700" },
  upgrading:   { label: "Upgrading",   classes: "border-orange-200 bg-orange-50 text-orange-700" },
  error:       { label: "Error",       classes: "border-red-200 bg-red-50 text-red-700" },
  uninstalled: { label: "Uninstalled", classes: "border-border bg-muted text-muted-foreground" },
  discovered:  { label: "Discovered",  classes: "border-border bg-muted text-muted-foreground" },
};

export default async function ModulesPage() {
  const rows = await db.select().from(modules).orderBy(asc(modules.name));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Modules</h1>
          <p className="mt-1 text-sm text-muted-foreground">Install, upgrade, and manage platform modules.</p>
        </div>
        <SyncMenusButton />
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-background">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <HiMiniCube className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">No modules registered</p>
            <p className="text-xs text-muted-foreground">Modules appear here once the platform is bootstrapped.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Module</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Version</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground sm:table-cell">Installed</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">State</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground md:table-cell">Installed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((mod) => {
                  const state = stateConfig[mod.state] ?? { label: mod.state, classes: "border-border bg-muted text-muted-foreground" };
                  return (
                    <tr key={mod.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{mod.title}</p>
                        <p className="font-mono text-xs text-muted-foreground">{mod.name}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{mod.version}</td>
                      <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground sm:table-cell">
                        {mod.installedVersion ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded border px-2 py-0.5 text-xs font-medium ${state.classes}`}>
                          {state.label}
                        </span>
                      </td>
                      <td className="hidden whitespace-nowrap px-4 py-3 text-muted-foreground md:table-cell">
                        {mod.installedAt ? mod.installedAt.toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
