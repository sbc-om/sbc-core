import { defineModule } from "@sbc/sdk";

export const manifest = defineModule({
  name:        "base",
  title:       "Base",
  description: "Core platform infrastructure: admin menus, settings, and system management.",
  version:     "1.0.0",
  author:      "SBC Team",
  category:    "system",

  depends:      [],
  installable:  false,
  application:  false,
  auto_install: true,

  permissions: [
    { key: "base.dashboard.view",  label: "View dashboard" },
    { key: "base.modules.view",    label: "View module manager" },
    { key: "base.modules.manage",  label: "Install / uninstall modules" },
    { key: "base.users.view",      label: "View users" },
    { key: "base.users.manage",    label: "Manage users" },
    { key: "base.roles.view",      label: "View roles & permissions" },
    { key: "base.roles.manage",    label: "Manage roles & permissions" },
    { key: "base.settings.view",   label: "View system settings" },
    { key: "base.settings.manage", label: "Manage system settings" },
    { key: "base.audit.view",      label: "View audit logs" },
  ],

  menus: [
    {
      key:      "base.dashboard",
      label:    "Dashboard",
      icon:     "LayoutDashboard",
      href:     "/",
      order:    1,
    },
    {
      key:   "base.admin",
      label: "Administration",
      icon:  "Settings2",
      order: 99,
      children: [
        {
          key:        "base.admin.modules",
          label:      "Modules",
          icon:       "Package",
          href:       "/modules",
          order:      1,
          permission: "base.modules.view",
        },
        {
          key:        "base.admin.users",
          label:      "Users",
          icon:       "Users",
          href:       "/users",
          order:      2,
          permission: "base.users.view",
        },
        {
          key:        "base.admin.roles",
          label:      "Roles & Permissions",
          icon:       "ShieldCheck",
          href:       "/roles",
          order:      3,
          permission: "base.roles.view",
        },
        {
          key:        "base.admin.audit",
          label:      "Audit Logs",
          icon:       "ScrollText",
          href:       "/audit",
          order:      4,
          permission: "base.audit.view",
        },
        {
          key:        "base.admin.settings",
          label:      "Settings",
          icon:       "SlidersHorizontal",
          href:       "/settings",
          order:      5,
          permission: "base.settings.view",
        },
      ],
    },
  ],
});
