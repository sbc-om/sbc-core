import { db, auditLogs, users } from "@sbc/database";
import { desc, eq } from "drizzle-orm";

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
        <h2 className="text-2xl font-bold tracking-tight">Audit Logs</h2>
        <p className="text-muted-foreground">Full trail of all system actions.</p>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-6">
            <p className="text-sm text-muted-foreground">No audit entries yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Resource</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Resource ID</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-mono text-xs">{log.action}</td>
                  <td className="px-4 py-3 text-muted-foreground">{log.resourceType}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground truncate max-w-[160px]">{log.resourceId ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {log.createdAt.toLocaleString()}
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
