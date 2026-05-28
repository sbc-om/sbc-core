import { boolean, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const menus = pgTable("menus", {
  id:         uuid("id").primaryKey().defaultRandom(),
  tenantId:   uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  key:        text("key").notNull().unique(),
  label:      text("label").notNull(),
  icon:       text("icon"),
  href:       text("href"),
  parentKey:  text("parent_key"),
  order:      integer("order").notNull().default(0),
  permission: text("permission"),
  module:     text("module").notNull(),
  isActive:   boolean("is_active").notNull().default(true),
  createdAt:  timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:  timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Menu    = typeof menus.$inferSelect;
export type NewMenu = typeof menus.$inferInsert;
