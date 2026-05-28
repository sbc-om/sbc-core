import { db, settings } from "@sbc/database";
import { eq, and } from "drizzle-orm";
import type { SettingDescriptor } from "@sbc/sdk";

export async function registerSettings(
  module: string,
  descriptors: SettingDescriptor[]
): Promise<void> {
  for (const desc of descriptors) {
    await db
      .insert(settings)
      .values({
        key:    desc.key,
        value:  desc.default ?? null,
        scope:  desc.scope,
        module,
      })
      .onConflictDoNothing();
  }
}

export async function getSetting<T>(
  key: string,
  options: { scope: "system" | "tenant" | "user"; tenantId?: string; userId?: string; default?: T }
): Promise<T | undefined> {
  const record = await db.query.settings.findFirst({
    where: and(
      eq(settings.key, key),
      eq(settings.scope, options.scope)
    ),
  });

  if (!record) return options.default;
  return record.value as T;
}

export async function setSetting(
  key: string,
  value: unknown,
  options: { scope: "system" | "tenant" | "user"; tenantId?: string; userId?: string }
): Promise<void> {
  await db
    .update(settings)
    .set({ value: value as Record<string, unknown>, updatedAt: new Date() })
    .where(and(eq(settings.key, key), eq(settings.scope, options.scope)));
}
