import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const events = pgTable("events", {
  id:           uuid("id").primaryKey().defaultRandom(),
  tenantId:     uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  name:         text("name").notNull(),
  payload:      jsonb("payload"),
  sourceModule: text("source_module").notNull(),
  status:       text("status").notNull().default("pending"),   // pending | processed | failed
  error:        text("error"),
  retries:      text("retries").notNull().default("0"),
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  processedAt:  timestamp("processed_at", { withTimezone: true }),
});

export type Event    = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
