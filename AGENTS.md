# AGENTS.md — SBC Core Engineering Guide

> Authoritative specification for all AI agents, LLM tools, and engineers working on this codebase.
> Every architectural decision, naming convention, and code pattern must conform to this document.

---

## 1. Project Identity & Vision

SBC Core is the foundation of a **modular Business Operating System** — not a single ERP application.

It is a **platform kernel** upon which fully isolated, installable business modules are deployed and managed. Think Odoo's module system but built natively on TypeScript, Next.js, and PostgreSQL with first-class AI and multi-tenancy support.

**Target capabilities:**

- Install, upgrade, and uninstall modules at runtime without downtime
- Automatic dependency resolution and migration ordering
- Per-tenant module activation and configuration
- Permission and menu systems driven entirely by registered modules
- An AI-ready event bus and workflow engine that any module can plug into
- A marketplace-ready module distribution system

**Installed modules include (but are not limited to):**

| Module | Key Concern |
|---|---|
| `crm` | Customers, leads, pipelines |
| `insurance` | Policies, claims, underwriting |
| `hr` | Employees, payroll, leave |
| `finance` | Invoices, payments, accounting |
| `documents` | Document storage, versioning |
| `workflow` | Visual workflow builder |
| `call_center` | Queues, agents, tickets |
| `ai_agents` | AI assistants, tool use |

The **Core** provides infrastructure only. Business logic lives exclusively in modules.

---

## 2. Core Principles

### 2.1 Infrastructure vs. Business Logic

```
Core provides:         Modules provide:
─────────────────      ────────────────────────────────
Auth                   Customer, Lead, Policy models
RBAC engine            Business-specific permissions
Module registry        Module manifests and migrations
Event bus              Domain events and handlers
Workflow runtime       Workflow definitions and steps
UI shell               Views, forms, reports
Audit log engine       Audit hooks per domain
Settings framework     Module-specific settings
Database utilities     Module schemas and seeds
API server (Hono)      Module API routes
```

### 2.2 Strict Separation Rules

- NEVER import a module package from another module package directly.
- NEVER import a module package into any `packages/*` package.
- Modules communicate only via: **events**, **typed contracts**, and **public SDK APIs**.
- Core packages (`packages/*`) must have zero knowledge of any specific module.

### 2.3 Module-First Design

Every feature that is not platform infrastructure must be a module. If in doubt, make it a module.

---

## 3. Monorepo Architecture

```
sbc-core/
├── apps/
│   └── console/                   # Next.js App Router — the main UI shell
│
├── packages/
│   ├── kernel/                    # Module registry, lifecycle, runtime
│   ├── database/                  # Drizzle config, migration runner, base utilities
│   ├── auth/                      # Authentication: sessions, JWT, OAuth providers
│   ├── rbac/                      # Permission engine, record rules, field security
│   ├── ui/                        # shadcn/ui component library, design tokens
│   ├── sdk/                       # Public SDK contracts — the only API modules may use
│   ├── events/                    # Typed event bus (publish, subscribe, replay)
│   ├── workflow/                  # Workflow runtime engine (triggers, steps, SLA)
│   ├── realtime/                  # WebSocket/SSE layer (presence, notifications)
│   ├── ai/                        # AI platform layer (tools, embeddings, prompts)
│   └── config/                    # Shared TypeScript, ESLint, Tailwind configs
│
├── modules/
│   ├── crm/
│   ├── insurance/
│   ├── hr/
│   ├── finance/
│   ├── documents/
│   ├── workflow_builder/
│   ├── call_center/
│   └── ai_agents/
│
├── docs/
├── docker/
│   ├── docker-compose.yml
│   └── docker-compose.dev.yml
├── turbo.json
├── pnpm-workspace.yaml
└── .env.example
```

---

## 4. Package Responsibilities

### `packages/kernel`

The heart of the platform. Owns the entire module lifecycle.

Exports:
- `ModuleRegistry` — singleton registry of all discovered modules
- `ModuleLoader` — resolves, validates, and loads modules in dependency order
- `ModuleInstaller` — runs install/upgrade/uninstall sequences
- `ModuleStateStore` — persists module states to the database
- `KernelContext` — provides runtime context to all module hooks

### `packages/database`

Owns Drizzle ORM configuration and migration infrastructure.

Exports:
- `db` — the Drizzle database client
- `runMigrations(moduleName?)` — executes pending migrations
- `createMigration(moduleName, name)` — scaffolds a new migration file
- `schema` — re-exports all core table schemas
- `BaseTable` — reusable Drizzle column definitions (id, timestamps, tenant_id, created_by)

### `packages/auth`

Authentication only. No authorization logic here.

Exports:
- `createSession(userId)` / `validateSession(token)`
- `hashPassword(plain)` / `verifyPassword(plain, hash)`
- `AuthProvider` — React context for current user
- `getServerSession()` — server-side session retrieval
- OAuth adapter contracts

### `packages/rbac`

Authorization engine. Zero business logic.

Exports:
- `requirePermission(userId, permission)` — throws if denied
- `hasPermission(userId, permission): Promise<boolean>`
- `getUserPermissions(userId): Promise<string[]>`
- `registerPermissions(modulePermissions[])` — called during module install
- `RecordRuleEngine` — evaluates row-level access rules
- `FieldPolicy` — field-level read/write restrictions

### `packages/sdk`

The **only** package that modules are allowed to import from core. Acts as a stable contract layer.

Exports:
- All type definitions for manifests, events, permissions, menu items, routes
- `defineModule(manifest)` — type-safe manifest factory
- `defineEvent(schema)` — typed event factory
- `definePermission(key, label)` — permission descriptor factory
- Re-exports safe subset of auth, rbac, events, workflow

### `packages/events`

Typed event bus. Supports in-process pub/sub and persistent event log.

Exports:
- `publish<T>(event: TypedEvent<T>)` — emit an event
- `subscribe<T>(eventName, handler)` — register a handler
- `replay(eventName, since?)` — replay past events from the log
- `EventLog` — Drizzle schema for the `events` table

### `packages/workflow`

Generic workflow runtime. No domain-specific logic.

Exports:
- `WorkflowEngine` — evaluates workflow definitions against trigger events
- `registerWorkflowStep(step)` — modules register custom steps
- `WorkflowBuilder` — programmatic workflow definition API
- Primitive step types: `TriggerStep`, `ConditionStep`, `ActionStep`, `ApprovalStep`, `NotificationStep`, `TimerStep`, `SLAStep`

### `packages/realtime`

WebSocket/SSE channel management.

Exports:
- `RealtimeServer` — manages channels and presence
- `broadcast(channel, payload)` — push to all subscribers
- `useChannel(name)` — React hook for client-side subscription

### `packages/ai`

AI platform layer. All AI access goes through this package.

Exports:
- `AIToolRegistry` — register typed tools for LLM tool use
- `AIPromptRunner` — execute prompts with permission checks and audit logging
- `EmbeddingService` — generate and store vector embeddings
- `AIContext` — injects current user context and tenant boundary

---

## 5. Technology Standards

### Frontend

| Concern | Technology |
|---|---|
| Framework | Next.js 15+ (App Router) |
| Language | TypeScript 5+ (strict mode) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui |
| Server state | TanStack Query v5 |
| Client state | Zustand v5 |
| Forms | React Hook Form + Zod |
| Tables | TanStack Table v8 |
| Charts | Recharts |
| Icons | Lucide React |
| Drag & drop | @dnd-kit |

### Backend

| Concern | Technology |
|---|---|
| HTTP framework | Hono (edge-compatible) |
| Database | PostgreSQL 16+ |
| ORM | Drizzle ORM |
| Validation | Zod |
| Auth sessions | Lucia Auth / Jose |
| Queues | pg-boss (PostgreSQL-backed) |
| Emails | React Email + Resend |
| File storage | S3-compatible (MinIO for local) |

### Infrastructure

| Concern | Technology |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| Containers | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Linting | ESLint + Prettier |
| Testing | Vitest + Playwright |

---

## 6. Module System

### 6.1 Module Manifest Specification

Every module MUST export a manifest as the single source of truth for its metadata, capabilities, and requirements.

```ts
// modules/crm/src/manifest.ts
import { defineModule } from "@sbc/sdk";

export const manifest = defineModule({
  // --- Identity ---
  name: "crm",                          // unique snake_case identifier
  title: "CRM",                         // human-readable display name
  description: "Customer Relationship Management module.",
  version: "1.0.0",                     // semver
  author: "SBC Team",
  category: "sales",                    // grouping in the marketplace UI

  // --- Dependencies ---
  depends: ["base"],                    // other module names required first
  optional_depends: ["workflow"],       // soft dependencies (load if present)
  conflicts: [],                        // incompatible modules

  // --- Capabilities ---
  permissions: [
    { key: "crm.view",            label: "View CRM records" },
    { key: "crm.create",          label: "Create CRM records" },
    { key: "crm.update",          label: "Update CRM records" },
    { key: "crm.delete",          label: "Delete CRM records" },
    { key: "crm.export",          label: "Export CRM data" },
    { key: "crm.lead.convert",    label: "Convert leads to customers" },
    { key: "crm.pipeline.manage", label: "Manage sales pipelines" },
  ],

  menus: [
    {
      key: "crm.root",
      label: "CRM",
      icon: "Users",
      order: 10,
      permission: "crm.view",
      children: [
        { key: "crm.customers",   label: "Customers",    href: "/crm/customers",   order: 1 },
        { key: "crm.leads",       label: "Leads",        href: "/crm/leads",       order: 2 },
        { key: "crm.pipelines",   label: "Pipelines",    href: "/crm/pipelines",   order: 3 },
        { key: "crm.reports",     label: "Reports",      href: "/crm/reports",     order: 4, permission: "crm.export" },
      ],
    },
  ],

  routes: [
    { path: "/crm",               handler: "@crm/routes/index" },
    { path: "/crm/customers",     handler: "@crm/routes/customers" },
    { path: "/crm/leads",         handler: "@crm/routes/leads" },
    { path: "/api/crm",           handler: "@crm/api/router",  type: "api" },
  ],

  events: {
    emits: [
      "crm.customer.created",
      "crm.customer.updated",
      "crm.customer.deleted",
      "crm.lead.created",
      "crm.lead.converted",
      "crm.pipeline.stage.changed",
    ],
    listens: [
      "finance.invoice.paid",     // update customer balance
      "workflow.approval.granted",
    ],
  },

  settings: [
    {
      key: "crm.default_pipeline",
      label: "Default Pipeline",
      type: "select",
      scope: "tenant",
      default: "sales",
    },
    {
      key: "crm.lead_expiry_days",
      label: "Lead Expiry (days)",
      type: "number",
      scope: "tenant",
      default: 30,
    },
  ],

  migrations: "./migrations",           // path to migration directory
  seed: "./seeds/demo.ts",              // optional demo data

  hooks: {
    pre_install:    "./hooks/pre_install.ts",
    post_install:   "./hooks/post_install.ts",
    pre_upgrade:    "./hooks/pre_upgrade.ts",
    post_upgrade:   "./hooks/post_upgrade.ts",
    pre_uninstall:  "./hooks/pre_uninstall.ts",
    post_uninstall: "./hooks/post_uninstall.ts",
  },

  auto_install: false,                  // install automatically when dependencies are met
  installable: true,                    // visible in the marketplace/app list
  application: true,                    // top-level app (vs. a sub-module/addon)
});
```

### 6.2 Module Lifecycle & State Machine

Every installed module record in the database must reflect one of these states:

```
                  ┌─────────────────────────────────────────┐
                  │                                         │
   [discovered] ──┤──► [to_install] ──► [installing] ──► [installed]
                  │                                    ▲        │
                  │                                    │        │
                  │                          [to_upgrade]  [to_uninstall]
                  │                                    │        │
                  │                            [upgrading]  [uninstalling]
                  │                                    │        │
                  └─────────────────────────────────[installed] [uninstalled]
```

| State | Meaning |
|---|---|
| `discovered` | Module files found but not yet registered in the database |
| `to_install` | Queued for installation (dependencies resolved) |
| `installing` | Installation in progress |
| `installed` | Fully operational |
| `to_upgrade` | New version detected, queued for upgrade |
| `upgrading` | Upgrade in progress |
| `to_uninstall` | Queued for removal |
| `uninstalling` | Removal in progress |
| `uninstalled` | Removed; database record retained for history |
| `error` | A lifecycle step failed; stores error details |

State transitions are atomic. A failure at any step must roll back to the previous stable state and write an error record.

### 6.3 Module Registry

The `ModuleRegistry` is a singleton that maintains the in-memory state of all modules.

```ts
// packages/kernel/src/registry.ts

interface ModuleRegistryEntry {
  manifest: ModuleManifest;
  state: ModuleState;
  installedVersion: string | null;
  availableVersion: string;
  path: string;
  loadedAt: Date | null;
}

class ModuleRegistry {
  private modules = new Map<string, ModuleRegistryEntry>();

  register(manifest: ModuleManifest, path: string): void
  get(name: string): ModuleRegistryEntry | undefined
  getAll(): ModuleRegistryEntry[]
  getInstalled(): ModuleRegistryEntry[]
  getByState(state: ModuleState): ModuleRegistryEntry[]
  setState(name: string, state: ModuleState): Promise<void>

  // Returns modules in dependency-safe load order (topological sort)
  getLoadOrder(names: string[]): string[]
}
```

### 6.4 Dependency Resolution

The kernel must perform **topological sort** of module dependencies before any lifecycle operation.

Rules:
- If module A `depends` on module B, module B must be installed first.
- If module A `depends` on module B, uninstalling B must first uninstall A.
- Circular dependencies are a hard error at startup.
- Optional dependencies are loaded only if present; their absence is not an error.
- Conflicting modules must not coexist in `installed` state.

```ts
// packages/kernel/src/resolver.ts

function buildDependencyGraph(modules: ModuleManifest[]): DependencyGraph
function topologicalSort(graph: DependencyGraph): string[]
function detectCircularDeps(graph: DependencyGraph): string[][] // returns cycles
function resolveInstallOrder(names: string[], registry: ModuleRegistry): string[]
function resolveUninstallOrder(names: string[], registry: ModuleRegistry): string[]
```

### 6.5 Module Installation

The install sequence must be **transactional**. If any step fails, all database changes from that module's install are rolled back.

```
install(moduleName):
  1. resolveInstallOrder([moduleName]) → ordered list including all deps
  2. For each module in order:
     a. setState(module, 'to_install')
     b. pre_install hook
     c. setState(module, 'installing')
     d. runMigrations(module)
     e. registerPermissions(module.permissions)
     f. registerMenus(module.menus)
     g. registerRoutes(module.routes)
     h. registerSettings(module.settings)
     i. subscribeEvents(module.events.listens)
     j. if (installDemoData) runSeed(module.seed)
     k. setState(module, 'installed')
     l. post_install hook
     m. emit('kernel.module.installed', { module: moduleName })
```

### 6.6 Module Upgrade

The upgrade sequence preserves data while applying schema changes.

```
upgrade(moduleName, fromVersion, toVersion):
  1. setState(module, 'to_upgrade')
  2. pre_upgrade hook (receives fromVersion, toVersion)
  3. setState(module, 'upgrading')
  4. runPendingMigrations(module)         // only migrations newer than fromVersion
  5. refreshPermissions(module.permissions)
  6. refreshMenus(module.menus)
  7. refreshRoutes(module.routes)
  8. refreshSettings(module.settings)
  9. updateInstalledVersion(module, toVersion)
  10. setState(module, 'installed')
  11. post_upgrade hook
  12. emit('kernel.module.upgraded', { module, fromVersion, toVersion })
```

### 6.7 Module Uninstallation

Uninstalling removes all registered resources. Schema data removal is opt-in (configurable).

```
uninstall(moduleName, { removeData = false }):
  1. resolveUninstallOrder([moduleName]) → dependents must uninstall first
  2. For each module in reverse order:
     a. setState(module, 'to_uninstall')
     b. pre_uninstall hook
     c. setState(module, 'uninstalling')
     d. unsubscribeEvents(module.events.listens)
     e. deregisterRoutes(module.routes)
     f. deregisterMenus(module.menus)
     g. deregisterPermissions(module.permissions)
     h. deregisterSettings(module.settings)
     i. if (removeData) runDownMigrations(module)
     j. setState(module, 'uninstalled')
     k. post_uninstall hook
     l. emit('kernel.module.uninstalled', { module: moduleName })
```

### 6.8 Hooks System

Hooks give modules controlled access to lifecycle events. Each hook receives a typed context.

```ts
// packages/sdk/src/hooks.ts

interface HookContext {
  db: DrizzleDb;
  tenantId: string | null;
  kernel: KernelContext;
  logger: Logger;
}

interface InstallHookContext extends HookContext {
  isFirstInstall: boolean;
}

interface UpgradeHookContext extends HookContext {
  fromVersion: string;
  toVersion: string;
}

interface UninstallHookContext extends HookContext {
  removeData: boolean;
}

// Hook file signatures
export type PreInstallHook    = (ctx: InstallHookContext)   => Promise<void>;
export type PostInstallHook   = (ctx: InstallHookContext)   => Promise<void>;
export type PreUpgradeHook    = (ctx: UpgradeHookContext)   => Promise<void>;
export type PostUpgradeHook   = (ctx: UpgradeHookContext)   => Promise<void>;
export type PreUninstallHook  = (ctx: UninstallHookContext) => Promise<void>;
export type PostUninstallHook = (ctx: UninstallHookContext) => Promise<void>;
```

---

## 7. Database & Migration System

### 7.1 Core Schema (packages/database)

These tables are owned by the core and exist in every installation.

```sql
-- Platform identity
users               (id, email, name, password_hash, avatar_url, is_active, tenant_id, created_at, updated_at)
tenants             (id, name, slug, plan, is_active, settings_json, created_at)

-- Auth
sessions            (id, user_id, token_hash, expires_at, ip_address, user_agent, created_at)
oauth_accounts      (id, user_id, provider, provider_user_id, access_token, refresh_token)

-- RBAC
roles               (id, name, label, tenant_id, is_system, created_at, updated_at)
permissions         (id, key, label, module, created_at)
role_permissions    (role_id, permission_id)
user_roles          (user_id, role_id, tenant_id)
record_rules        (id, name, module, model, domain_expr, permission_type, role_id)

-- Module system
modules             (id, name, title, version, state, installed_version, installed_at, error, tenant_id)
module_migrations   (id, module, filename, checksum, ran_at)
menus               (id, key, label, icon, href, parent_key, order, permission, module, tenant_id, is_active)
routes              (id, path, handler, type, module, is_active)

-- Settings
settings            (id, key, value_json, scope, module, tenant_id, updated_by, updated_at)

-- Audit
audit_logs          (id, user_id, tenant_id, action, resource_type, resource_id, before_json, after_json, ip_address, user_agent, created_at)

-- Events
events              (id, name, payload_json, source_module, tenant_id, created_at, processed_at)

-- Sequences
sequences           (id, name, prefix, next_value, padding, module, tenant_id)
```

### 7.2 Module Schema Isolation

Each module owns its own Drizzle schema file. Module tables must be prefixed with the module name.

```ts
// modules/crm/src/db/schema.ts
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { BaseTable } from "@sbc/database";

export const crmCustomers = pgTable("crm_customers", {
  ...BaseTable,                              // id, created_at, updated_at, created_by, updated_by, tenant_id
  name:        text("name").notNull(),
  email:       text("email"),
  phone:       text("phone"),
  status:      text("status").notNull().default("active"),
  pipelineId:  uuid("pipeline_id"),
  ownerId:     uuid("owner_id"),
});

export const crmLeads = pgTable("crm_leads", {
  ...BaseTable,
  title:       text("title").notNull(),
  value:       text("value"),
  stage:       text("stage").notNull().default("new"),
  customerId:  uuid("customer_id"),
  assignedTo:  uuid("assigned_to"),
  convertedAt: timestamp("converted_at"),
});
```

### 7.3 Migration Tracking

Migrations are per-module, version-stamped SQL or TypeScript files.

```
modules/crm/migrations/
  0001_create_crm_customers.ts
  0002_create_crm_leads.ts
  0003_add_crm_pipeline_id.ts
  0004_add_crm_lead_value.ts
```

Each migration file must export:

```ts
export async function up(db: DrizzleDb): Promise<void> { /* ... */ }
export async function down(db: DrizzleDb): Promise<void> { /* ... */ }
export const description = "Create crm_customers table";
```

The migration runner tracks which migrations have run in `module_migrations`. It will never run the same migration (by filename + checksum) twice.

### 7.4 BaseTable Standard Columns

Every business table MUST include these columns via the `BaseTable` helper:

```ts
// packages/database/src/base.ts
export const BaseTable = {
  id:         uuid("id").primaryKey().defaultRandom(),
  tenantId:   uuid("tenant_id").notNull(),          // multi-tenancy boundary
  createdAt:  timestamp("created_at").notNull().defaultNow(),
  updatedAt:  timestamp("updated_at").notNull().defaultNow(),
  createdBy:  uuid("created_by"),                   // user.id FK
  updatedBy:  uuid("updated_by"),                   // user.id FK
  isDeleted:  boolean("is_deleted").notNull().default(false), // soft delete
  deletedAt:  timestamp("deleted_at"),
  deletedBy:  uuid("deleted_by"),
};
```

---

## 8. RBAC & Permission System

### 8.1 Permission Model

Use **permission-based** authorization everywhere. Role names must never appear in application code.

Permission key format: `<module>.<resource>.<action>`

```
crm.view                      // view any CRM record
crm.customer.create           // create customers
crm.customer.update           // update customers
crm.customer.delete           // delete customers
crm.customer.export           // export customer data
crm.lead.convert              // convert a lead to customer
crm.pipeline.manage           // manage pipeline stages
insurance.policy.approve      // approve insurance policies
finance.invoice.void          // void invoices
hr.employee.salary.view       // view salary information
```

**Never do this:**
```ts
if (user.role === "admin") {
  // allow
}
```

**Always do this:**
```ts
// In server components / API routes
await requirePermission(userId, "crm.customer.create");

// In React components
const can = usePermission("crm.customer.create");
if (!can) return <AccessDenied />;
```

### 8.2 Record Rules (Row-Level Security)

Record rules restrict which rows a user can read or write based on a domain expression evaluated at query time.

```ts
// Defined in module manifest or via post_install hook
{
  name: "CRM: Users see only their own leads",
  module: "crm",
  model: "crm_leads",
  domain: { assigned_to: "{{ user.id }}" },
  permission_type: "read",
  role: "crm_user",
}
```

The `RecordRuleEngine` in `packages/rbac` injects WHERE clauses into Drizzle queries automatically when record rules are registered for a model.

### 8.3 Field-Level Security

Sensitive fields can be hidden or made read-only for specific roles:

```ts
{
  model: "hr_employees",
  field: "salary",
  permission: "hr.employee.salary.view",
  access: "read",               // "read" | "write" | "none"
}
```

---

## 9. Dynamic Menu System

Menus are never hardcoded. The sidebar, topbar, and navigation are entirely derived from registered menu items filtered by user permissions.

```ts
// packages/kernel/src/menus.ts

interface MenuItem {
  key:        string;
  label:      string;
  icon?:      string;           // Lucide icon name
  href?:      string;
  order:      number;
  permission?: string;          // Required permission key
  children?:  MenuItem[];
  badge?:     MenuBadge;        // Dynamic badge (unread count, etc.)
  module:     string;           // Owning module
  tenantId?:  string;
}

async function getMenusForUser(userId: string, tenantId: string): Promise<MenuItem[]>
```

Loading menus for a user:
1. Fetch all `menus` records for the tenant where `is_active = true`
2. Load all permissions for the user
3. Filter out menu items where the user lacks the required permission
4. Sort by `order` at each level
5. Build nested tree from `parent_key` references
6. Return the final tree

---

## 10. Route Registration

Modules register both UI routes and API routes. The console app mounts them dynamically.

```ts
// packages/kernel/src/routes.ts

interface RouteDescriptor {
  path:    string;
  handler: string;             // module-relative import path
  type:    "page" | "api" | "layout" | "middleware";
  module:  string;
  meta?: {
    permission?:  string;
    layout?:      string;
    preload?:     boolean;
  };
}
```

**API routes** are Hono router instances. The kernel mounts each module's router under its path prefix:

```ts
// apps/console/src/server/index.ts
const app = new Hono();

for (const module of registry.getInstalled()) {
  const apiRoutes = await import(module.manifest.routes.find(r => r.type === "api")!.handler);
  app.route(`/api/${module.manifest.name}`, apiRoutes.router);
}
```

---

## 11. Event Bus

### 11.1 Typed Events

All events must be typed using `defineEvent`:

```ts
// modules/crm/src/events.ts
import { defineEvent } from "@sbc/sdk";

export const CustomerCreatedEvent = defineEvent({
  name: "crm.customer.created",
  schema: z.object({
    customerId: z.string().uuid(),
    name:       z.string(),
    tenantId:   z.string().uuid(),
    createdBy:  z.string().uuid(),
  }),
});

export const LeadConvertedEvent = defineEvent({
  name: "crm.lead.converted",
  schema: z.object({
    leadId:     z.string().uuid(),
    customerId: z.string().uuid(),
    tenantId:   z.string().uuid(),
  }),
});
```

### 11.2 Publishing Events

```ts
import { publish } from "@sbc/events";
import { CustomerCreatedEvent } from "./events";

await publish(CustomerCreatedEvent, {
  customerId: customer.id,
  name:       customer.name,
  tenantId:   ctx.tenantId,
  createdBy:  ctx.userId,
});
```

### 11.3 Subscribing to Events

Subscriptions are registered in the module's `post_install` hook or event registry:

```ts
// modules/finance/src/handlers/crm.ts
import { subscribe } from "@sbc/events";

subscribe("crm.customer.created", async (payload) => {
  await createCustomerLedgerAccount(payload.customerId, payload.tenantId);
});

subscribe("crm.lead.converted", async (payload) => {
  await createInitialOpportunity(payload);
});
```

### 11.4 Event Persistence

Every published event is persisted to the `events` table before handlers are called. This enables:
- Replay for debugging
- Retry on handler failure
- Audit trail of all system state changes
- Event sourcing if needed

---

## 12. Settings System

### 12.1 Setting Scopes

| Scope | Description |
|---|---|
| `system` | Platform-wide, affects all tenants. Admin-only. |
| `tenant` | Per-tenant configuration. Tenant admin can modify. |
| `user` | Per-user preferences. User can modify. |

### 12.2 Reading and Writing Settings

```ts
import { getSetting, setSetting } from "@sbc/sdk";

// Read
const defaultPipeline = await getSetting<string>(
  "crm.default_pipeline",
  { scope: "tenant", tenantId: ctx.tenantId, default: "sales" }
);

// Write (permission-checked)
await setSetting(
  "crm.default_pipeline",
  "enterprise",
  { scope: "tenant", tenantId: ctx.tenantId, userId: ctx.userId }
);
```

### 12.3 Settings Registration

Modules declare settings in their manifest. The kernel registers them on install. Unregistered keys cannot be written.

---

## 13. Audit Log System

Every mutation to any business record must produce an audit log entry.

```ts
// packages/kernel/src/audit.ts

interface AuditEntry {
  userId:       string;
  tenantId:     string;
  action:       "create" | "update" | "delete" | "view" | "export" | string;
  resourceType: string;           // e.g. "crm_customer"
  resourceId:   string;
  before?:      Record<string, unknown>;
  after?:       Record<string, unknown>;
  ipAddress?:   string;
  userAgent?:   string;
}

async function audit(entry: AuditEntry): Promise<void>
```

Usage in module service:

```ts
await db.transaction(async (tx) => {
  const updated = await tx.update(crmCustomers)
    .set({ name: input.name })
    .where(eq(crmCustomers.id, id))
    .returning();

  await audit({
    userId:       ctx.userId,
    tenantId:     ctx.tenantId,
    action:       "update",
    resourceType: "crm_customer",
    resourceId:   id,
    before:       original,
    after:        updated[0],
  });
});
```

---

## 14. UI Shell & Dynamic Layout

### 14.1 Shell Composition

The console app renders a dynamic shell. No module-specific code exists in the shell itself.

```tsx
// apps/console/src/app/layout.tsx
// The shell loads navigation, breadcrumbs, and content slots dynamically.

export default async function AppLayout({ children }) {
  const user = await getServerSession();
  const menus = await getMenusForUser(user.id, user.tenantId);
  const modules = await getInstalledModules(user.tenantId);

  return (
    <ShellProvider menus={menus} modules={modules} user={user}>
      <Sidebar />
      <main>{children}</main>
      <CommandPalette />
      <NotificationCenter />
    </ShellProvider>
  );
}
```

### 14.2 Slot System

Modules can inject UI into predefined shell slots without modifying core code:

```ts
// Slots available for modules to populate
type ShellSlot =
  | "sidebar.bottom"          // Below main navigation
  | "topbar.right"            // Topbar right side
  | "dashboard.widgets"       // Dashboard widget grid
  | "command.palette"         // Command palette entries
  | "notification.providers"  // Notification sources
  | "user.menu"               // User dropdown items
```

Modules register slot components in their manifest:
```ts
slots: [
  { slot: "sidebar.bottom",   component: "@crm/slots/QuickAddButton" },
  { slot: "dashboard.widgets", component: "@crm/slots/RecentLeadsWidget" },
],
```

---

## 15. API Layer (Hono)

### 15.1 Module API Structure

Each module exposes a Hono router:

```ts
// modules/crm/src/api/router.ts
import { Hono } from "hono";
import { requirePermission } from "@sbc/sdk";
import { customersRouter } from "./customers";
import { leadsRouter } from "./leads";

export const router = new Hono()
  .use("*", authMiddleware)
  .use("*", tenantMiddleware)
  .route("/customers", customersRouter)
  .route("/leads", leadsRouter);
```

### 15.2 Route Handler Pattern

```ts
// modules/crm/src/api/customers.ts

export const customersRouter = new Hono()
  .get("/", async (c) => {
    await requirePermission(c.var.userId, "crm.view");
    const customers = await listCustomers(c.var.tenantId);
    return c.json({ data: customers });
  })
  .post("/", zValidator("json", CreateCustomerSchema), async (c) => {
    await requirePermission(c.var.userId, "crm.customer.create");
    const customer = await createCustomer(c.req.valid("json"), c.var);
    return c.json({ data: customer }, 201);
  })
  .get("/:id", async (c) => {
    await requirePermission(c.var.userId, "crm.view");
    const customer = await getCustomer(c.req.param("id"), c.var.tenantId);
    if (!customer) return c.json({ error: "Not found" }, 404);
    return c.json({ data: customer });
  });
```

### 15.3 Standard API Response Shape

```ts
// Success
{ "data": <payload>, "meta": { "page": 1, "total": 100 } }

// Error
{ "error": { "code": "PERMISSION_DENIED", "message": "...", "details": {} } }

// Validation error
{ "error": { "code": "VALIDATION_ERROR", "issues": [...] } }
```

---

## 16. Workflow Engine

The workflow engine is a generic, event-driven state machine. Modules contribute workflow definitions; the engine executes them.

### 16.1 Workflow Definition

```ts
// modules/insurance/src/workflows/policy_approval.ts
import { defineWorkflow } from "@sbc/sdk";

export const policyApprovalWorkflow = defineWorkflow({
  name: "insurance.policy.approval",
  trigger: { event: "insurance.policy.created" },
  steps: [
    {
      id: "check_premium",
      type: "condition",
      field: "payload.premium",
      operator: "gt",
      value: 5000,
      onTrue:  "require_approval",
      onFalse: "auto_approve",
    },
    {
      id: "require_approval",
      type: "approval",
      assignTo: { role: "insurance.underwriter" },
      title:    "Approve policy {{ payload.policyNumber }}",
      sla:      { hours: 24 },
      onApprove: "notify_customer",
      onReject:  "notify_rejection",
    },
    {
      id: "auto_approve",
      type: "action",
      action: "insurance.policy.activate",
    },
    {
      id: "notify_customer",
      type: "notification",
      channel: "email",
      template: "insurance.policy_approved",
      to: "{{ payload.customerEmail }}",
    },
    {
      id: "notify_rejection",
      type: "notification",
      channel: "email",
      template: "insurance.policy_rejected",
      to: "{{ payload.customerEmail }}",
    },
  ],
});
```

### 16.2 Workflow Primitives

| Step Type | Description |
|---|---|
| `trigger` | Starts the workflow on an event or schedule |
| `condition` | Branches flow based on field evaluation |
| `action` | Calls a registered module action |
| `approval` | Creates a human approval task |
| `notification` | Sends email/SMS/push notification |
| `timer` | Waits for a duration or until a date |
| `sla` | Escalates if not completed within SLA |
| `loop` | Iterates over a collection |
| `parallel` | Executes branches concurrently |
| `sub_workflow` | Calls another workflow |

---

## 17. AI Platform Layer

AI is a **platform capability** — not a module. All AI features go through `packages/ai`.

### 17.1 AI Tool Registry

Modules register typed tools that the AI can call:

```ts
// modules/crm/src/ai/tools.ts
import { defineAITool } from "@sbc/ai";

export const searchCustomersTool = defineAITool({
  name: "crm_search_customers",
  description: "Search for customers by name, email, or phone.",
  permission: "crm.view",
  input: z.object({
    query:  z.string(),
    limit:  z.number().int().min(1).max(50).default(10),
  }),
  output: z.array(CustomerSchema),
  execute: async (input, ctx) => {
    return searchCustomers(input.query, ctx.tenantId, input.limit);
  },
});
```

### 17.2 AI Rules

- AI must always respect RBAC — tool execution checks the calling user's permissions.
- AI tool calls must produce audit log entries.
- AI must never bypass tenant boundaries.
- No module data may be sent to external LLMs without explicit tenant consent.
- Vector embeddings are stored per-tenant.

---

## 18. Multi-Tenancy

### 18.1 Tenant Isolation Model

SBC Core uses **shared database, isolated data** (row-level multi-tenancy).

Every business table includes `tenant_id`. All queries must be scoped to `tenant_id`.

```ts
// WRONG — never query without tenantId
const customers = await db.select().from(crmCustomers);

// CORRECT — always scope to tenant
const customers = await db.select()
  .from(crmCustomers)
  .where(eq(crmCustomers.tenantId, ctx.tenantId));
```

### 18.2 Tenant Context Propagation

The `tenantMiddleware` in Hono extracts the tenant from the session and attaches it to the request context. Every downstream service receives `ctx.tenantId`.

### 18.3 Per-Tenant Module Activation

Different tenants may have different modules installed. The `modules` table includes `tenant_id` to support this.

---

## 19. Realtime Layer

The realtime layer provides WebSocket channels for live updates.

```ts
// packages/realtime/src/server.ts

// Channel naming convention: <module>:<resource>:<id>
// Examples:
//   crm:customers:all         — any customer changed
//   crm:customer:uuid-123     — specific customer changed
//   workflow:task:uuid-456    — specific task changed
//   notifications:user:uuid   — user's notification feed

broadcast("crm:customer:" + customer.id, {
  event:   "updated",
  payload: customer,
  tenantId: ctx.tenantId,
});
```

Client subscriptions are permission-checked. A user cannot subscribe to a channel unless they have the appropriate permission.

---

## 20. Security Rules

### 20.1 Mandatory Checks

- Validate all external input with Zod at the API boundary. Never trust client data.
- Every API route that mutates data must call `requirePermission`.
- Every API route must be behind `authMiddleware`.
- Sensitive operations must produce audit log entries.
- Rate-limit all public and auth endpoints.
- Never expose stack traces or internal error messages to API clients.

### 20.2 Secrets Management

- Never commit secrets to the repository.
- All secrets must be in environment variables.
- Maintain a complete `.env.example` with documented placeholder values.
- Use different secrets per environment (dev/staging/production).

### 20.3 Input Validation at Boundaries

```ts
// GOOD — validate at the boundary, trust internally
.post("/", zValidator("json", CreateCustomerSchema), async (c) => {
  const validated = c.req.valid("json"); // already safe
  await createCustomer(validated, c.var);
})

// BAD — validating deep inside the service where the data is already trusted
async function createCustomer(data: unknown) {
  const parsed = CreateCustomerSchema.parse(data); // unnecessary
}
```

### 20.4 SQL Injection Prevention

Always use Drizzle ORM query builder. Never use raw string interpolation in SQL.

```ts
// WRONG
db.execute(sql`SELECT * FROM users WHERE email = '${email}'`)

// CORRECT
db.select().from(users).where(eq(users.email, email))
```

---

## 21. Testing Standards

### 21.1 Test Types

| Type | Tool | Scope |
|---|---|---|
| Unit tests | Vitest | Pure functions, utilities |
| Integration tests | Vitest + real DB | Service layer, DB queries |
| API tests | Vitest + Hono test client | Route handlers |
| E2E tests | Playwright | Full user flows |

### 21.2 Test File Placement

```
modules/crm/
  src/
    services/customers.ts
    services/customers.test.ts      # co-located unit tests
  tests/
    integration/customers.test.ts   # integration tests
    e2e/crm.spec.ts                 # Playwright E2E
```

### 21.3 Test Rules

- Integration tests must use a real PostgreSQL database (never mock the DB layer).
- Each test must clean up its own data using transactions or truncate.
- Do not mock modules in cross-module tests — use the real module via the SDK.

---

## 22. Development Workflow

### 22.1 Pre-Merge Checklist

```bash
pnpm lint          # ESLint — zero warnings policy
pnpm typecheck     # tsc --noEmit across all packages
pnpm test          # Vitest unit + integration
pnpm build         # Turborepo full build
```

### 22.2 Commit Standards

Use Conventional Commits format:

```
feat(crm): add lead pipeline stage drag-and-drop
fix(rbac): resolve permission cache invalidation on role update
chore(deps): upgrade drizzle-orm to 0.35.0
docs(agents): update module lifecycle documentation
```

### 22.3 Code Quality Rules

- **No god files.** Max ~300 lines per file. Split by concern.
- **No any.** TypeScript strict mode is non-negotiable.
- **No hardcoded IDs, slugs, or permission strings** outside of their source-of-truth location (manifest).
- **No direct DB access from React components.** Always go through API routes or Server Actions.
- **No cross-module imports.** Only `@sbc/sdk` may be imported from modules.
- **No business logic in the core packages.** Only infrastructure.

---

## 23. Module Development Guide

### 23.1 Scaffolding a New Module

```bash
pnpm sbc scaffold module <module-name>
```

This generates:
```
modules/<name>/
  src/
    manifest.ts       # Module manifest
    index.ts          # Public exports
    api/
      router.ts       # Hono router
    db/
      schema.ts       # Drizzle schema
    services/         # Business logic
    hooks/            # Lifecycle hooks
    events.ts         # Typed event definitions
    ai/
      tools.ts        # AI tool definitions
    slots/            # UI slot components (optional)
  migrations/
    0001_initial.ts
  tests/
  package.json
```

### 23.2 Module Package.json Conventions

```json
{
  "name": "@sbc/crm",
  "version": "1.0.0",
  "private": true,
  "exports": {
    ".": "./src/index.ts",
    "./manifest": "./src/manifest.ts"
  },
  "dependencies": {
    "@sbc/sdk": "workspace:*"
  }
}
```

### 23.3 What a Module May Import

| Source | Allowed? |
|---|---|
| `@sbc/sdk` | YES — the public contract layer |
| `@sbc/ui` | YES — shared UI components |
| `@sbc/config` | YES — shared TS/ESLint config |
| `@sbc/database` | ONLY in migrations and hooks via HookContext |
| `@sbc/kernel` | NO — use SDK instead |
| `@sbc/rbac` | NO — use `sdk.requirePermission` |
| `@sbc/events` | NO — use `sdk.publish` / `sdk.subscribe` |
| Another module | NO — use events or SDK contracts |

---

## 24. Phased Roadmap

### Phase 1 — Foundation (Weeks 1–2)
- [ ] Monorepo setup (pnpm workspaces, Turborepo)
- [ ] Shared TypeScript and ESLint config (`packages/config`)
- [ ] Docker Compose (PostgreSQL, Redis, MinIO)
- [ ] Next.js console app scaffold
- [ ] Basic auth (email/password + sessions)

### Phase 2 — Core Kernel (Weeks 3–4)
- [ ] `packages/database` — Drizzle setup, BaseTable, migration runner
- [ ] Core schema (users, tenants, roles, permissions, modules)
- [ ] `packages/kernel` — ModuleRegistry, ModuleLoader
- [ ] Module discovery and state persistence
- [ ] Dependency resolution (topological sort)

### Phase 3 — Module Lifecycle (Weeks 5–6)
- [ ] Full install/upgrade/uninstall sequence
- [ ] Hook system (pre/post for each lifecycle event)
- [ ] Per-module migration runner
- [ ] Module state machine with rollback on failure
- [ ] Admin UI: App/Module manager

### Phase 4 — RBAC & Menus (Weeks 7–8)
- [ ] `packages/rbac` — permission engine, record rules
- [ ] Dynamic menu loader from module registrations
- [ ] Dynamic sidebar driven by user permissions
- [ ] `packages/auth` — session, OAuth integration
- [ ] RBAC admin UI (roles, permissions, assignments)

### Phase 5 — Event Bus & Settings (Weeks 9–10)
- [ ] `packages/events` — typed publish/subscribe, event log
- [ ] Settings system (system/tenant/user scopes)
- [ ] Audit log engine
- [ ] Admin UI: Event log viewer, Audit log viewer

### Phase 6 — First Module (Weeks 11–12)
- [ ] `modules/crm` — customers, leads, pipelines
- [ ] API routes (Hono) with full RBAC
- [ ] UI pages with TanStack Query
- [ ] CRM events integration with event bus
- [ ] CRM settings and menu registration

### Phase 7 — Workflow & Realtime (Weeks 13–15)
- [ ] `packages/workflow` — runtime engine, step types
- [ ] `packages/realtime` — WebSocket channels
- [ ] Workflow builder UI
- [ ] Admin UI: Workflow definitions

### Phase 8 — AI Layer (Weeks 16–18)
- [ ] `packages/ai` — tool registry, prompt runner, embeddings
- [ ] AI tool registration from modules
- [ ] "Ask the ERP" interface
- [ ] AI audit logging and permission enforcement

### Phase 9 — Additional Modules (Ongoing)
- [ ] `modules/hr` — employees, leave, payroll
- [ ] `modules/finance` — invoices, payments, ledger
- [ ] `modules/insurance` — policies, claims
- [ ] `modules/documents` — storage, versioning
- [ ] `modules/call_center` — queues, tickets

### Phase 10 — Marketplace (Future)
- [ ] Module packaging and distribution format
- [ ] Module signature verification
- [ ] Marketplace UI
- [ ] Paid module licensing

---

## 25. Final Rule

**Build SBC Core as a product-grade modular platform — not as a one-off ERP application.**

Every line of code must be answerable to these questions:

1. **Is this infrastructure or business logic?** — If business logic, it belongs in a module.
2. **Does this couple two modules?** — If yes, replace with an event or SDK contract.
3. **Is this hardcoded?** — If yes, drive it from the database or module manifest.
4. **Can this work for all tenants?** — If no, fix the multi-tenancy boundary.
5. **Does this bypass RBAC?** — If yes, it is a security bug. Fix it immediately.
6. **Will this survive module removal?** — If no, redesign the dependency.

Every decision must support:

- **Modularity** — clean boundaries, no hidden coupling
- **Scalability** — stateless services, efficient queries, queue-backed operations
- **Security** — RBAC everywhere, audit logs, no secret leakage
- **Multi-tenancy** — tenant_id on every query, every row
- **AI readiness** — typed tools, permission-aware, auditable
- **Marketplace readiness** — installable, upgradeable, uninstallable modules
- **Developer experience** — typed contracts, scaffolding tools, clear errors
