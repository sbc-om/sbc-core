"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, settings } from "@sbc/database";
import type { BuiltinWidgetConfig } from "@/lib/builtin-widgets";

const KEY    = "dashboard.builtin.widgets";
const MODULE = "kernel";

export type { BuiltinWidgetConfig };

export async function getBuiltinWidgetConfig(
  userId: string,
): Promise<BuiltinWidgetConfig[] | null> {
  const [row] = await db
    .select({ value: settings.value })
    .from(settings)
    .where(and(eq(settings.key, KEY), eq(settings.userId, userId)))
    .limit(1);

  if (!row?.value) return null;
  try {
    return row.value as BuiltinWidgetConfig[];
  } catch {
    return null;
  }
}

export async function saveBuiltinWidgetConfig(
  userId:   string,
  tenantId: string,
  config:   BuiltinWidgetConfig[],
): Promise<{ error?: string }> {
  try {
    await db.delete(settings).where(
      and(eq(settings.key, KEY), eq(settings.userId, userId)),
    );
    await db.insert(settings).values({
      key:       KEY,
      module:    MODULE,
      scope:     "user",
      userId,
      tenantId,
      value:     config,
      updatedBy: userId,
      updatedAt: new Date(),
    });
    revalidatePath("/");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to save widget config" };
  }
}
