import { db, auditLogs } from "@sbc/database";

export interface AuditEntry {
  userId?:      string;
  tenantId?:    string;
  action:       string;
  resourceType: string;
  resourceId?:  string;
  before?:      Record<string, unknown>;
  after?:       Record<string, unknown>;
  metadata?:    Record<string, unknown>;
  ipAddress?:   string;
  userAgent?:   string;
}

export async function audit(entry: AuditEntry): Promise<void> {
  await db.insert(auditLogs).values({
    userId:       entry.userId,
    tenantId:     entry.tenantId,
    action:       entry.action,
    resourceType: entry.resourceType,
    resourceId:   entry.resourceId,
    before:       entry.before as Record<string, unknown>,
    after:        entry.after  as Record<string, unknown>,
    metadata:     entry.metadata as Record<string, unknown>,
    ipAddress:    entry.ipAddress,
    userAgent:    entry.userAgent,
  });
}
