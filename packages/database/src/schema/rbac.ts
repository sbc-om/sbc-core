import { boolean, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { users } from "./users";

export const roles = pgTable("roles", {
  id:        uuid("id").primaryKey().defaultRandom(),
  tenantId:  uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  name:      text("name").notNull(),
  label:     text("label").notNull(),
  isSystem:  boolean("is_system").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const permissions = pgTable("permissions", {
  id:        uuid("id").primaryKey().defaultRandom(),
  key:       text("key").notNull().unique(),
  label:     text("label").notNull(),
  module:    text("module").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rolePermissions = pgTable("role_permissions", {
  roleId:       uuid("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  permissionId: uuid("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.roleId, t.permissionId] })]);

export const userRoles = pgTable("user_roles", {
  userId:    uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roleId:    uuid("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  tenantId:  uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.userId, t.roleId, t.tenantId] })]);

export const recordRules = pgTable("record_rules", {
  id:             uuid("id").primaryKey().defaultRandom(),
  name:           text("name").notNull(),
  module:         text("module").notNull(),
  model:          text("model").notNull(),
  domainExpr:     text("domain_expr").notNull(),
  permissionType: text("permission_type").notNull().default("read"),
  roleId:         uuid("role_id").references(() => roles.id, { onDelete: "cascade" }),
  isActive:       boolean("is_active").notNull().default(true),
  createdAt:      timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Role           = typeof roles.$inferSelect;
export type Permission     = typeof permissions.$inferSelect;
export type NewPermission  = typeof permissions.$inferInsert;
export type RecordRule     = typeof recordRules.$inferSelect;
