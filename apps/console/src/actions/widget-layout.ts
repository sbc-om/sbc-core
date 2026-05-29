"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, settings } from "@sbc/database";

const LAYOUT_KEY    = "dashboard.widget.layout";
const LAYOUT_MODULE = "kernel";

export interface WidgetLayoutItem {
  id:      string;   // module name
  enabled: boolean;
  order:   number;
}

export async function getWidgetLayout(userId: string): Promise<WidgetLayoutItem[] | null> {
  const [row] = await db
    .select({ value: settings.value })
    .from(settings)
    .where(and(eq(settings.key, LAYOUT_KEY), eq(settings.userId, userId)))
    .limit(1);

  if (!row?.value) return null;
  try { return row.value as WidgetLayoutItem[]; } catch { return null; }
}

export async function saveWidgetLayout(
  userId:   string,
  tenantId: string,
  layout:   WidgetLayoutItem[],
): Promise<{ error?: string }> {
  try {
    // Upsert: delete existing row then insert fresh (simpler than managing constraint)
    await db.delete(settings).where(
      and(eq(settings.key, LAYOUT_KEY), eq(settings.userId, userId))
    );
    await db.insert(settings).values({
      key:       LAYOUT_KEY,
      module:    LAYOUT_MODULE,
      scope:     "user",
      userId,
      tenantId,
      value:     layout,
      updatedBy: userId,
      updatedAt: new Date(),
    });
    revalidatePath("/");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to save layout" };
  }
}
