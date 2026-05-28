import { db, settings } from "@sbc/database";
import { asc } from "drizzle-orm";

export default async function SettingsPage() {
  const rows = await db
    .select({ key: settings.key, value: settings.value, scope: settings.scope, module: settings.module })
    .from(settings)
    .orderBy(asc(settings.module), asc(settings.key));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">System, tenant, and module configuration.</p>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-6">
            <p className="text-sm text-muted-foreground">No settings registered yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Key</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Value</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Scope</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Module</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-mono text-xs">{row.key}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{JSON.stringify(row.value)}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-muted px-2 py-0.5 text-xs">{row.scope}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{row.module}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
