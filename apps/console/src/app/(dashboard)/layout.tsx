import { Sidebar } from "@sbc/ui";
import type { SidebarMenuItem } from "@sbc/ui";
import { db, menus as menusTable } from "@sbc/database";
import { eq, asc } from "drizzle-orm";

async function getMenus(): Promise<SidebarMenuItem[]> {
  try {
    const rows = await db
      .select()
      .from(menusTable)
      .where(eq(menusTable.isActive, true))
      .orderBy(asc(menusTable.order));

    const rootItems = rows.filter((m) => !m.parentKey);
    const childMap  = new Map<string, typeof rows>();
    for (const m of rows) {
      if (m.parentKey) {
        const arr = childMap.get(m.parentKey) ?? [];
        arr.push(m);
        childMap.set(m.parentKey, arr);
      }
    }

    function buildTree(items: typeof rows): SidebarMenuItem[] {
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
  } catch {
    return [];
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const menus = await getMenus();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar menus={menus} appName="SBC Core" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center border-b border-border bg-background px-6">
          <h1 className="text-sm font-medium text-muted-foreground">SBC Core — Business Operating System</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
