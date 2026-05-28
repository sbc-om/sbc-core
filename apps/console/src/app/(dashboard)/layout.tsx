import { redirect } from "next/navigation";
import { NavigationSidebar } from "@/components/navigation-sidebar";
import { UserHeader } from "@/components/user-header";
import { getSessionUser } from "@/lib/session";
import { getMenusForUser } from "@sbc/kernel";
import { SYSTEM_TENANT_ID } from "@/lib/bootstrap";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const tenantId = user.tenantId ?? SYSTEM_TENANT_ID;
  const menus    = await getMenusForUser(user.id, tenantId).catch(() => []);

  return (
    <div className="flex h-screen overflow-hidden">
      <NavigationSidebar menus={menus} appName="SBC ERP" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <UserHeader user={{ name: user.name, email: user.email, isSuperAdmin: user.isSuperAdmin }} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
