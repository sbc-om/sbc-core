import { sql } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";
import { baseColumns } from "@sbc/database/base";

export const contacts = pgTable("contacts", {
  ...baseColumns,
  firstName: text("first_name").notNull(),
  lastName:  text("last_name"),
  email:     text("email"),
  phone:     text("phone"),
  company:   text("company"),
  jobTitle:  text("job_title"),
  address:   text("address"),
  city:      text("city"),
  country:   text("country"),
  notes:     text("notes"),
  tags:      text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
});

export type Contact    = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
