import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const sequences = pgTable("sequences", {
  id:        uuid("id").primaryKey().defaultRandom(),
  tenantId:  uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  name:      text("name").notNull(),
  prefix:    text("prefix").notNull().default(""),
  nextValue: integer("next_value").notNull().default(1),
  padding:   integer("padding").notNull().default(4),
  module:    text("module").notNull(),
});

export type Sequence    = typeof sequences.$inferSelect;
export type NewSequence = typeof sequences.$inferInsert;
