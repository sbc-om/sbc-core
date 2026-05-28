import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { users } from "./users";

export const settings = pgTable("settings", {
  id:        uuid("id").primaryKey().defaultRandom(),
  key:       text("key").notNull(),
  value:     jsonb("value"),
  scope:     text("scope").notNull().default("tenant"),  // system | tenant | user
  module:    text("module").notNull(),
  tenantId:  uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  userId:    uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  updatedBy: uuid("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Setting    = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
