"use client";

import { useState } from "react";
import { NavigationSidebar } from "./navigation-sidebar";
import { UserHeader } from "./user-header";
import type { SidebarMenuItem } from "@sbc/ui";

interface Props {
  menus:    SidebarMenuItem[];
  user:     { name: string; email: string; isSuperAdmin: boolean };
  children: React.ReactNode;
}

export function ShellLayout({ menus, user, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-30 transition-transform duration-200 ease-in-out lg:static lg:shrink-0 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <NavigationSidebar
          menus={menus}
          appName="SBC ERP"
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <UserHeader
          user={user}
          onMenuToggle={() => setSidebarOpen((p) => !p)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
