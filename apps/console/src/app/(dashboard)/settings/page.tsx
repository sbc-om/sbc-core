import { db, settings } from "@sbc/database";
import { asc } from "drizzle-orm";
import { HiMiniCog6Tooth } from "react-icons/hi2";

export default async function SettingsPage() {
  const rows = await db
    .select({ key: settings.key, value: settings.value, scope: settings.scope, module: settings.module })
    .from(settings)
    .orderBy(asc(settings.module), asc(settings.key));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">System, tenant, and module configuration.</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-background">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <HiMiniCog6Tooth className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">No settings registered</p>
            <p className="text-xs text-muted-foreground">Settings are registered when modules are installed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Key</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Scope</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground sm:table-cell">Module</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.key} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{row.key}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 font-mono text-xs text-muted-foreground">
                      {JSON.stringify(row.value)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {row.scope}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{row.module}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
