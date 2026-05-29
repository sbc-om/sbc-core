export type Pricing       = "free" | "pro" | "enterprise";
export type CatalogStatus = "installed" | "available" | "in_progress" | "error" | "coming_soon" | "core";

export interface CatalogModule {
  name:          string;
  title:         string;
  description:   string;
  category:      string;
  categoryLabel: string;
  icon:          string;   // key into MODULE_ICONS map
  version:       string;
  author:        string;
  pricing:       Pricing;
  priceLabel?:   string;
  depends:       string[];
  tags:          string[];
  featured:      boolean;
  installable:   boolean;
}

export const CATEGORIES = [
  { key: "all",           label: "All",           icon: "grid" },
  { key: "installed",     label: "Installed",      icon: "check" },
  { key: "sales",         label: "Sales",          icon: "users" },
  { key: "hr",            label: "HR",             icon: "briefcase" },
  { key: "finance",       label: "Finance",        icon: "banknotes" },
  { key: "operations",    label: "Operations",     icon: "cog" },
  { key: "communication", label: "Communication",  icon: "phone" },
  { key: "ai",            label: "AI",             icon: "sparkles" },
  { key: "system",        label: "System",         icon: "cpu" },
] as const;

export const CATALOG: CatalogModule[] = [
  // ── System (core) ────────────────────────────────────────────────
  {
    name:          "base",
    title:         "Platform Core",
    description:   "Admin menus, system settings, audit logging, and the module lifecycle engine.",
    category:      "system",
    categoryLabel: "System",
    icon:          "cpu",
    version:       "1.0.2",
    author:        "SBC Team",
    pricing:       "free",
    depends:       [],
    tags:          ["core", "kernel", "settings", "audit"],
    featured:      false,
    installable:   false,
  },
  {
    name:          "iam",
    title:         "Users & Access",
    description:   "User accounts, role-based access control, and granular permission management.",
    category:      "system",
    categoryLabel: "System",
    icon:          "lock",
    version:       "1.0.1",
    author:        "SBC Team",
    pricing:       "free",
    depends:       ["base"],
    tags:          ["users", "roles", "permissions", "rbac"],
    featured:      false,
    installable:   false,
  },
  {
    name:          "documents",
    title:         "File Manager",
    description:   "Centralized file storage, versioning, and cross-module document linking.",
    category:      "operations",
    categoryLabel: "Operations",
    icon:          "folder",
    version:       "1.0.1",
    author:        "SBC Team",
    pricing:       "free",
    depends:       ["base"],
    tags:          ["files", "storage", "uploads", "links"],
    featured:      false,
    installable:   true,
  },

  // ── Sales ────────────────────────────────────────────────────────
  {
    name:          "crm",
    title:         "CRM",
    description:   "Manage customers, leads, and sales pipelines from one unified workspace.",
    category:      "sales",
    categoryLabel: "Sales",
    icon:          "users",
    version:       "1.0.0",
    author:        "SBC Team",
    pricing:       "free",
    depends:       ["base"],
    tags:          ["customers", "leads", "pipelines", "sales"],
    featured:      true,
    installable:   false,
  },

  // ── HR ───────────────────────────────────────────────────────────
  {
    name:          "hr",
    title:         "Human Resources",
    description:   "Employee records, leave management, payroll processing, and org chart views.",
    category:      "hr",
    categoryLabel: "HR",
    icon:          "briefcase",
    version:       "1.0.0",
    author:        "SBC Team",
    pricing:       "pro",
    priceLabel:    "$29 / mo",
    depends:       ["base"],
    tags:          ["employees", "payroll", "leave", "org-chart"],
    featured:      true,
    installable:   false,
  },

  // ── Finance ──────────────────────────────────────────────────────
  {
    name:          "finance",
    title:         "Finance",
    description:   "Invoices, payments, expenses, and a full double-entry accounting ledger.",
    category:      "finance",
    categoryLabel: "Finance",
    icon:          "banknotes",
    version:       "1.0.0",
    author:        "SBC Team",
    pricing:       "pro",
    priceLabel:    "$39 / mo",
    depends:       ["base"],
    tags:          ["invoices", "payments", "accounting", "ledger"],
    featured:      true,
    installable:   false,
  },
  {
    name:          "insurance",
    title:         "Insurance",
    description:   "Policy lifecycle management, claims processing, and underwriting workflows.",
    category:      "finance",
    categoryLabel: "Finance",
    icon:          "shield",
    version:       "1.0.0",
    author:        "SBC Team",
    pricing:       "enterprise",
    priceLabel:    "$99 / mo",
    depends:       ["base", "finance"],
    tags:          ["policies", "claims", "underwriting", "insurance"],
    featured:      false,
    installable:   false,
  },

  // ── Operations ───────────────────────────────────────────────────
  {
    name:          "workflow_builder",
    title:         "Workflow Builder",
    description:   "Visual drag-and-drop designer for multi-step workflows with approval steps and SLA tracking.",
    category:      "operations",
    categoryLabel: "Operations",
    icon:          "workflow",
    version:       "1.0.0",
    author:        "SBC Team",
    pricing:       "pro",
    priceLabel:    "$19 / mo",
    depends:       ["base"],
    tags:          ["workflows", "automation", "approvals", "sla"],
    featured:      true,
    installable:   false,
  },

  // ── Communication ────────────────────────────────────────────────
  {
    name:          "call_center",
    title:         "Call Center",
    description:   "Agent queues, ticket management, SLA routing, and call logging across teams.",
    category:      "communication",
    categoryLabel: "Communication",
    icon:          "phone",
    version:       "1.0.0",
    author:        "SBC Team",
    pricing:       "pro",
    priceLabel:    "$49 / mo",
    depends:       ["base", "crm"],
    tags:          ["calls", "tickets", "queues", "agents", "support"],
    featured:      false,
    installable:   false,
  },

  // ── AI ───────────────────────────────────────────────────────────
  {
    name:          "ai_agents",
    title:         "AI Agents",
    description:   "Embed AI assistants into any module with tool use, vector embeddings, and audit-safe prompt runners.",
    category:      "ai",
    categoryLabel: "AI",
    icon:          "sparkles",
    version:       "1.0.0",
    author:        "SBC Team",
    pricing:       "enterprise",
    priceLabel:    "$79 / mo",
    depends:       ["base"],
    tags:          ["ai", "llm", "embeddings", "tools", "automation"],
    featured:      true,
    installable:   false,
  },
];
