import { db, auditLogs } from "@sbc/database";
import { desc } from "drizzle-orm";
import { PiScrollDuotone } from "react-icons/pi";

export default async function AuditPage() {
  const logs = await db
    .select({
      id:           auditLogs.id,
      action:       auditLogs.action,
      resourceType: auditLogs.resourceType,
      resourceId:   auditLogs.resourceId,
      createdAt:    auditLogs.createdAt,
    })
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Audit Log</h1>
        <p className="mt-1 text-sm text-muted-foreground">A complete trail of all system actions.</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-background">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <PiScrollDuotone className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">No audit entries yet</p>
            <p className="text-xs text-muted-foreground">Actions performed on the platform will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Resource</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground sm:table-cell">Resource ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <span className="inline-block rounded border border-border bg-muted px-2 py-0.5 font-mono text-xs">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{log.resourceType}</td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className="block max-w-[160px] truncate font-mono text-xs text-muted-foreground">
                        {log.resourceId ?? "—"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {log.createdAt.toLocaleString()}
                    </td>
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
