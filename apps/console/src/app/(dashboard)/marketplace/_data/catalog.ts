export type Pricing = "free" | "pro" | "enterprise";
export type CatalogStatus = "installed" | "available" | "in_progress" | "error" | "coming_soon" | "core";

export interface CatalogModule {
  name:         string;
  title:        string;
  description:  string;
  category:     string;
  categoryLabel: string;
  icon:         string;   // emoji
  version:      string;
  author:       string;
  pricing:      Pricing;
  priceLabel?:  string;
  depends:      string[];
  tags:         string[];
  featured:     boolean;
  installable:  boolean;  // false = coming soon
}

export const CATEGORIES = [
  { key: "all",           label: "All" },
  { key: "installed",     label: "Installed" },
  { key: "sales",         label: "Sales" },
  { key: "hr",            label: "HR" },
  { key: "finance",       label: "Finance" },
  { key: "operations",    label: "Operations" },
  { key: "communication", label: "Communication" },
  { key: "ai",            label: "AI" },
  { key: "system",        label: "System" },
] as const;

export const PRICING_CONFIG: Record<Pricing, { label: string; classes: string }> = {
  free:       { label: "Free",       classes: "border-green-200 bg-green-50 text-green-700" },
  pro:        { label: "Pro",        classes: "border-blue-200 bg-blue-50 text-blue-700" },
  enterprise: { label: "Enterprise", classes: "border-purple-200 bg-purple-50 text-purple-700" },
};

export const CATALOG: CatalogModule[] = [
  // ── System (core, always installed) ─────────────────────────────
  {
    name:          "base",
    title:         "Platform Core",
    description:   "Admin menus, system settings, audit logging, and the module lifecycle engine.",
    category:      "system",
    categoryLabel: "System",
    icon:          "⚙️",
    version:       "1.0.1",
    author:        "SBC Team",
    pricing:       "free",
    depends:       [],
    tags:          ["core", "system", "menus", "settings"],
    featured:      false,
    installable:   false,
  },
  {
    name:          "iam",
    title:         "Users & Access",
    description:   "User accounts, role-based access control, and permission management.",
    category:      "system",
    categoryLabel: "System",
    icon:          "🔐",
    version:       "1.0.0",
    author:        "SBC Team",
    pricing:       "free",
    depends:       ["base"],
    tags:          ["core", "users", "roles", "permissions", "rbac"],
    featured:      false,
    installable:   false,
  },
  {
    name:          "documents",
    title:         "File Manager",
    description:   "Centralized file storage, versioning, and cross-module document linking.",
    category:      "operations",
    categoryLabel: "Operations",
    icon:          "📁",
    version:       "1.0.0",
    author:        "SBC Team",
    pricing:       "free",
    depends:       ["base"],
    tags:          ["files", "storage", "documents", "uploads"],
    featured:      false,
    installable:   true,
  },

  // ── Sales ────────────────────────────────────────────────────────
  {
    name:          "crm",
    title:         "CRM",
    description:   "Manage customers, leads, and sales pipelines from a single unified view.",
    category:      "sales",
    categoryLabel: "Sales & CRM",
    icon:          "👥",
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
    description:   "Employee records, leave requests, payroll, and org chart management.",
    category:      "hr",
    categoryLabel: "Human Resources",
    icon:          "🧑‍💼",
    version:       "1.0.0",
    author:        "SBC Team",
    pricing:       "pro",
    priceLabel:    "$29 / mo",
    depends:       ["base"],
    tags:          ["employees", "payroll", "leave", "hr"],
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
    icon:          "💰",
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
    description:   "Policy management, claims processing, and underwriting workflows.",
    category:      "finance",
    categoryLabel: "Finance",
    icon:          "🛡️",
    version:       "1.0.0",
    author:        "SBC Team",
    pricing:       "enterprise",
    priceLabel:    "$99 / mo",
    depends:       ["base", "finance"],
    tags:          ["insurance", "policies", "claims", "underwriting"],
    featured:      false,
    installable:   false,
  },

  // ── Operations ───────────────────────────────────────────────────
  {
    name:          "workflow_builder",
    title:         "Workflow Builder",
    description:   "Visual drag-and-drop workflow designer with approval steps and SLA tracking.",
    category:      "operations",
    categoryLabel: "Operations",
    icon:          "🔀",
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
    description:   "Agent queues, ticket management, SLA routing, and call logging.",
    category:      "communication",
    categoryLabel: "Communication",
    icon:          "☎️",
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
    description:   "Embed AI assistants into any module with tool use, embeddings, and audit-safe prompt runners.",
    category:      "ai",
    categoryLabel: "AI",
    icon:          "🤖",
    version:       "1.0.0",
    author:        "SBC Team",
    pricing:       "enterprise",
    priceLabel:    "$79 / mo",
    depends:       ["base"],
    tags:          ["ai", "llm", "tools", "embeddings", "automation"],
    featured:      true,
    installable:   false,
  },
];
