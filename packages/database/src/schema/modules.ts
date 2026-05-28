import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const moduleStateEnum = [
  "discovered",
  "to_install",
  "installing",
  "installed",
  "to_upgrade",
  "upgrading",
  "to_uninstall",
  "uninstalling",
  "uninstalled",
  "error",
] as const;

export type ModuleState = (typeof moduleStateEnum)[number];

export const modules = pgTable("modules", {
  id:               uuid("id").primaryKey().defaultRandom(),
  tenantId:         uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  name:             text("name").notNull(),
  title:            text("title").notNull(),
  version:          text("version").notNull(),
  installedVersion: text("installed_version"),
  state:            text("state").notNull().default("discovered"),
  error:            text("error"),
  installedAt:      timestamp("installed_at", { withTimezone: true }),
  createdAt:        timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:        timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const moduleMigrations = pgTable("module_migrations", {
  id:       uuid("id").primaryKey().defaultRandom(),
  module:   text("module").notNull(),
  filename: text("filename").notNull(),
  checksum: text("checksum").notNull(),
  ranAt:    timestamp("ran_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Module          = typeof modules.$inferSelect;
export type NewModule       = typeof modules.$inferInsert;
export type ModuleMigration = typeof moduleMigrations.$inferSelect;
