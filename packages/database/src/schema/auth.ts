import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

export const sessions = pgTable("sessions", {
  id:          uuid("id").primaryKey().defaultRandom(),
  userId:      uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash:   text("token_hash").notNull().unique(),
  ipAddress:   text("ip_address"),
  userAgent:   text("user_agent"),
  expiresAt:   timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const oauthAccounts = pgTable("oauth_accounts", {
  id:             uuid("id").primaryKey().defaultRandom(),
  userId:         uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider:       text("provider").notNull(),
  providerUserId: text("provider_user_id").notNull(),
  accessToken:    text("access_token"),
  refreshToken:   text("refresh_token"),
  expiresAt:      timestamp("expires_at", { withTimezone: true }),
  createdAt:      timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:      timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Session       = typeof sessions.$inferSelect;
export type NewSession    = typeof sessions.$inferInsert;
export type OAuthAccount  = typeof oauthAccounts.$inferSelect;
