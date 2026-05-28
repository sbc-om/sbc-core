import { defineModule } from "@sbc/sdk";

export const manifest = defineModule({
  name:        "iam",
  title:       "Identity & Access Management",
  description: "User management, roles, and permission assignment.",
  version:     "1.0.0",
  author:      "SBC Team",
  category:    "system",
  depends:     ["base"],

  permissions: [
    { key: "iam.users.view",         label: "View users list" },
    { key: "iam.users.create",       label: "Create users" },
    { key: "iam.users.update",       label: "Update users" },
    { key: "iam.users.deactivate",   label: "Deactivate/reactivate users" },
    { key: "iam.roles.view",         label: "View roles" },
    { key: "iam.roles.create",       label: "Create roles" },
    { key: "iam.roles.update",       label: "Update roles" },
    { key: "iam.roles.delete",       label: "Delete roles" },
    { key: "iam.roles.assign",       label: "Assign roles to users" },
    { key: "iam.permissions.assign", label: "Assign permissions to roles" },
  ],

  menus: [
    {
      key:        "iam.users",
      label:      "Users",
      icon:       "Users",
      href:       "/users",
      order:      2,
      permission: "iam.users.view",
    },
    {
      key:        "iam.roles",
      label:      "Roles & Permissions",
      icon:       "ShieldCheck",
      href:       "/roles",
      order:      3,
      permission: "iam.roles.view",
    },
  ],
});
