import { defineModule } from "@sbc/sdk";

export const manifest = defineModule({
  name:        "iam",
  title:       "Identity & Access Management",
  description: "User management, roles, and permission assignment.",
  version:     "1.0.1",
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

  // Menus are registered by the base module under Administration.
  // IAM does not register duplicate root-level menu items.
  menus: [],
});
