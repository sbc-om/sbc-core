import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { users } from "./users";

export const auditLogs = pgTable("audit_logs", {
  id:           uuid("id").primaryKey().defaultRandom(),
  tenantId:     uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  userId:       uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  action:       text("action").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId:   text("resource_id"),
  before:       jsonb("before"),
  after:        jsonb("after"),
  metadata:     jsonb("metadata"),
  ipAddress:    text("ip_address"),
  userAgent:    text("user_agent"),
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AuditLog    = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
