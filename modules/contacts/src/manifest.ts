import { defineModule } from "@sbc/sdk";

export const manifest = defineModule({
  name:        "contacts",
  title:       "Contacts",
  description: "Store and manage people and organizations — the foundation for CRM, HR, and communication modules.",
  version:     "1.0.0",
  author:      "SBC Team",
  category:    "sales",
  depends:     ["base"],
  installable: true,
  application: true,

  permissions: [
    { key: "contacts.view",   label: "View contacts" },
    { key: "contacts.create", label: "Create contacts" },
    { key: "contacts.update", label: "Update contacts" },
    { key: "contacts.delete", label: "Delete contacts" },
  ],

  menus: [
    {
      key:        "contacts.root",
      label:      "Contacts",
      icon:       "Identification",
      href:       "/contacts",
      order:      10,
      permission: "contacts.view",
    },
  ],
});
