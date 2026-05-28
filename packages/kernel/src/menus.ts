import { db, menus } from "@sbc/database";
import { eq, and, asc } from "drizzle-orm";
import { hasPermission } from "@sbc/rbac";
import type { MenuItemDescriptor } from "@sbc/sdk";

export async function registerMenus(
  module: string,
  items: MenuItemDescriptor[],
  tenantId?: string
): Promise<void> {
  function flattenMenuItems(
    items: MenuItemDescriptor[],
    parentKey?: string
  ): Array<MenuItemDescriptor & { parentKey?: string }> {
    return items.flatMap((item) => {
      const flat = { ...item, parentKey };
      const children = item.children
        ? flattenMenuItems(item.children, item.key)
        : [];
      return [flat, ...children];
    });
  }

  const flat = flattenMenuItems(items);

  for (const item of flat) {
    await db
      .insert(menus)
      .values({
        key:        item.key,
        label:      item.label,
        icon:       item.icon,
        href:       item.href,
        parentKey:  item.parentKey,
        order:      item.order ?? 0,
        permission: item.permission,
        module,
        tenantId,
        isActive:   true,
      })
      .onConflictDoUpdate({
        target: menus.key,
        set: {
          label:      item.label,
          icon:       item.icon,
          href:       item.href,
          parentKey:  item.parentKey,
          order:      item.order ?? 0,
          permission: item.permission,
          isActive:   true,
        },
      });
  }
}

export async function deregisterMenus(module: string): Promise<void> {
  await db.update(menus).set({ isActive: false }).where(eq(menus.module, module));
}

export interface MenuTreeItem {
  key:        string;
  label:      string;
  icon?:      string | null;
  href?:      string | null;
  order:      number;
  children:   MenuTreeItem[];
}

export async function getMenusForUser(
  userId: string,
  tenantId: string
): Promise<MenuTreeItem[]> {
  const allMenus = await db
    .select()
    .from(menus)
    .where(and(eq(menus.isActive, true)))
    .orderBy(asc(menus.order));

  // Filter by permission
  const visible: typeof allMenus = [];
  for (const menu of allMenus) {
    if (!menu.permission) {
      visible.push(menu);
      continue;
    }
    const allowed = await hasPermission(userId, tenantId, menu.permission);
    if (allowed) visible.push(menu);
  }

  // Build tree
  const rootItems = visible.filter((m) => !m.parentKey);
  const childMap  = new Map<string, typeof allMenus>();
  for (const m of visible) {
    if (m.parentKey) {
      const arr = childMap.get(m.parentKey) ?? [];
      arr.push(m);
      childMap.set(m.parentKey, arr);
    }
  }

  function buildTree(items: typeof allMenus): MenuTreeItem[] {
    return items.map((m) => ({
      key:      m.key,
      label:    m.label,
      icon:     m.icon,
      href:     m.href,
      order:    m.order,
      children: buildTree(childMap.get(m.key) ?? []),
    }));
  }

  return buildTree(rootItems);
}
