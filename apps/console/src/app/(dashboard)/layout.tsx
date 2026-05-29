import { redirect } from "next/navigation";
import { ShellLayout } from "@/components/shell-layout";
import { getSessionUser } from "@/lib/session";
import { getMenusForUser } from "@sbc/kernel";
import { SYSTEM_TENANT_ID } from "@/lib/bootstrap";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const tenantId = user.tenantId ?? SYSTEM_TENANT_ID;
  const menus    = await getMenusForUser(user.id, tenantId).catch(() => []);

  return (
    <ShellLayout
      menus={menus}
      user={{ name: user.name, email: user.email, isSuperAdmin: user.isSuperAdmin }}
    >
      {children}
    </ShellLayout>
  );
}
