import { db, modules } from "@sbc/database";
import { asc } from "drizzle-orm";

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
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Modules</h2>
        <p className="text-muted-foreground">Install, upgrade, and manage platform modules.</p>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
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
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{mod.installedVersion ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${stateColors[mod.state] ?? "bg-gray-100 text-gray-600"}`}>
                      {mod.state}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {mod.installedAt ? mod.installedAt.toLocaleString() : "—"}
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
