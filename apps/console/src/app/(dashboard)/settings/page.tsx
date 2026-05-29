import Link from "next/link";
import { db, settings } from "@sbc/database";
import { asc } from "drizzle-orm";
import type { IconType } from "react-icons";
import {
  HiMiniArrowRight,
  HiMiniBellAlert,
  HiMiniBriefcase,
  HiMiniChatBubbleLeftRight,
  HiMiniCircleStack,
  HiMiniCog6Tooth,
  HiMiniCpuChip,
  HiMiniDocumentText,
  HiMiniLanguage,
  HiMiniLockClosed,
  HiMiniPaintBrush,
  HiMiniSquares2X2,
  HiMiniSwatch,
  HiMiniUser,
  HiMiniUserGroup,
  HiMiniUsers,
} from "react-icons/hi2";
import { getSessionUser } from "@/lib/session";
import { getBuiltinWidgetConfig } from "@/actions/builtin-widget-settings";
import { ModuleSettingsPanel } from "./_components/module-settings-panel";
import { WidgetSettings } from "./_components/widget-settings";
import { SYSTEM_TENANT_ID } from "@/lib/bootstrap";
import { cn } from "@sbc/ui";

interface SearchParams {
  section?: string | string[];
  moduleScope?: string | string[];
  modulePage?: string | string[];
  moduleSection?: string | string[];
  widgetCategory?: string | string[];
  widgetPage?: string | string[];
}

interface SettingsCard {
  id: string;
  title: string;
  description: string;
  group: string;
  icon: IconType;
  href: string;
  badge?: string;
}

function getParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getPage(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildSettingsHref(params: {
  section?: string | null;
  moduleScope: string;
  modulePage: number;
  moduleSection: string | null;
  widgetCategory: string;
  widgetPage: number;
}) {
  const search = new URLSearchParams();

  if (params.section) search.set("section", params.section);
  if (params.moduleScope !== "all") search.set("moduleScope", params.moduleScope);
  if (params.modulePage > 1) search.set("modulePage", String(params.modulePage));
  if (params.moduleSection) search.set("moduleSection", params.moduleSection);
  if (params.widgetCategory !== "all") search.set("widgetCategory", params.widgetCategory);
  if (params.widgetPage > 1) search.set("widgetPage", String(params.widgetPage));

  const query = search.toString();
  return query ? `/settings?${query}` : "/settings";
}

function renderInfoPanel(title: string, description: string, actions: string[]) {
  return (
    <section className="space-y-5 rounded-lg border border-border/70 bg-background p-6 shadow-sm lg:p-8">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => (
          <div key={action} className="rounded-lg border border-border/70 bg-muted/20 px-4 py-3 text-sm text-foreground">
            {action}
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function SettingsPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = (await searchParams) ?? {};
  const [rows, user] = await Promise.all([
    db
      .select({ key: settings.key, value: settings.value, scope: settings.scope, module: settings.module })
      .from(settings)
      .orderBy(asc(settings.module), asc(settings.key)),
    getSessionUser(),
  ]);

  const tenantId       = user?.tenantId ?? SYSTEM_TENANT_ID;
  const widgetConfig   = user ? (await getBuiltinWidgetConfig(user.id)) ?? [] : [];
  const moduleCount    = new Set(rows.map((row) => row.module ?? "core")).size;
  const moduleScope    = getParam(params.moduleScope) ?? "all";
  const modulePage     = getPage(getParam(params.modulePage));
  const moduleSection  = getParam(params.moduleSection) ?? null;
  const widgetCategory = getParam(params.widgetCategory) ?? "all";
  const widgetPage     = getPage(getParam(params.widgetPage));
  const activeSection  = getParam(params.section) ?? null;

  const settingsCards: SettingsCard[] = [
    {
      id: "profile",
      title: "Profile",
      description: "Identity, avatar, and account basics.",
      group: "Account",
      icon: HiMiniUser,
      href: user ? `/users/${user.id}` : "/users",
    },
    {
      id: "password",
      title: "Password",
      description: "Credentials, access, and sign-in updates.",
      group: "Account",
      icon: HiMiniLockClosed,
      href: user ? `/users/${user.id}` : "/users",
    },
    {
      id: "language",
      title: "Language",
      description: "Locale and interface language preferences.",
      group: "Account",
      icon: HiMiniLanguage,
      href: buildSettingsHref({ section: "language", moduleScope, modulePage, moduleSection, widgetCategory, widgetPage }),
    },
    {
      id: "appearance",
      title: "Appearance",
      description: "Visual density, theme direction, and layout feel.",
      group: "Account",
      icon: HiMiniPaintBrush,
      href: buildSettingsHref({ section: "appearance", moduleScope, modulePage, moduleSection, widgetCategory, widgetPage }),
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Control alerts, reminders, and message delivery.",
      group: "Account",
      icon: HiMiniBellAlert,
      href: buildSettingsHref({ section: "notifications", moduleScope, modulePage, moduleSection, widgetCategory, widgetPage }),
    },
    {
      id: "whatsapp",
      title: "WhatsApp",
      description: "Conversation channel and delivery configuration.",
      group: "Account",
      icon: HiMiniChatBubbleLeftRight,
      href: buildSettingsHref({ section: "whatsapp", moduleScope, modulePage, moduleSection, widgetCategory, widgetPage }),
    },
    {
      id: "ai",
      title: "Ameen AI",
      description: "Assistants, automations, and AI workspace defaults.",
      group: "Workspace",
      icon: HiMiniCpuChip,
      href: buildSettingsHref({ section: "ai", moduleScope, modulePage, moduleSection, widgetCategory, widgetPage }),
    },
    {
      id: "backup",
      title: "Backup & Restore",
      description: "Snapshot policy, exports, and recovery routines.",
      group: "Workspace",
      icon: HiMiniCircleStack,
      href: buildSettingsHref({ section: "backup", moduleScope, modulePage, moduleSection, widgetCategory, widgetPage }),
    },
    {
      id: "module-settings",
      title: "Operation",
      description: "Module-level configuration and operational controls.",
      group: "Operations",
      icon: HiMiniCog6Tooth,
      href: buildSettingsHref({ section: "module-settings", moduleScope, modulePage, moduleSection, widgetCategory, widgetPage }),
      badge: `${moduleCount} modules`,
    },
    {
      id: "sales",
      title: "Sales People",
      description: "Contacts, assignments, and commercial records.",
      group: "Operations",
      icon: HiMiniUsers,
      href: "/contacts",
    },
    {
      id: "hr",
      title: "HR Manager",
      description: "People directory, access, and workforce ownership.",
      group: "Operations",
      icon: HiMiniUserGroup,
      href: "/users",
    },
    {
      id: "accounting",
      title: "Accounting",
      description: "Financial setup, ledgers, and policy surfaces.",
      group: "Operations",
      icon: HiMiniBriefcase,
      href: buildSettingsHref({ section: "accounting", moduleScope, modulePage, moduleSection, widgetCategory, widgetPage }),
    },
    {
      id: "workflow",
      title: "Workflow",
      description: "Automation rules, approval paths, and orchestration.",
      group: "Operations",
      icon: HiMiniSwatch,
      href: buildSettingsHref({ section: "workflow", moduleScope, modulePage, moduleSection, widgetCategory, widgetPage }),
    },
    {
      id: "document-types",
      title: "Document Types",
      description: "Files, document categories, and linked assets.",
      group: "Operations",
      icon: HiMiniDocumentText,
      href: "/files",
    },
    {
      id: "widgets",
      title: "Dashboard Widgets",
      description: "Personal dashboard blocks and visibility rules.",
      group: "Operations",
      icon: HiMiniSquares2X2,
      href: buildSettingsHref({ section: "dashboard-widgets", moduleScope, modulePage, moduleSection, widgetCategory, widgetPage }),
    },
  ];

  const groupedCards = Array.from(
    settingsCards.reduce((acc, card) => {
      const current = acc.get(card.group) ?? [];
      current.push(card);
      acc.set(card.group, current);
      return acc;
    }, new Map<string, SettingsCard[]>()),
  );

  let detailPanel: React.ReactNode = null;

  if (activeSection === "module-settings") {
    detailPanel = (
      <section className="space-y-4 rounded-lg border border-border/70 bg-background p-6 shadow-sm lg:p-8">
        <div className="flex items-center gap-3">
          <HiMiniCog6Tooth className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Module Settings</h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 py-16 text-center">
            <HiMiniCog6Tooth className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">No settings registered</p>
            <p className="text-xs text-muted-foreground">Settings are registered when modules are installed.</p>
          </div>
        ) : (
          <ModuleSettingsPanel
            rows={rows}
            scopeFilter={moduleScope}
            currentPage={modulePage}
            expandedModule={moduleSection}
            widgetCategory={widgetCategory}
            widgetPage={widgetPage}
          />
        )}
      </section>
    );
  } else if (activeSection === "dashboard-widgets") {
    detailPanel = user ? (
      <section className="space-y-4 rounded-lg border border-border/70 bg-background p-6 shadow-sm lg:p-8">
        <div className="flex items-center gap-3">
          <HiMiniSquares2X2 className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Dashboard Widgets</h2>
          <div className="h-px flex-1 bg-border" />
        </div>
        <p className="text-xs text-muted-foreground">
          Choose which widgets appear on your dashboard. Changes apply to your account only.
        </p>
        <WidgetSettings
          userId={user.id}
          tenantId={tenantId}
          initialConfig={widgetConfig}
          activeCategory={widgetCategory}
          currentPage={widgetPage}
          moduleScope={moduleScope}
          modulePage={modulePage}
          expandedModule={moduleSection}
        />
      </section>
    ) : null;
  } else if (activeSection === "language") {
    detailPanel = renderInfoPanel("Language", "Keep interface language and regional behavior centralized.", ["Primary language: English", "Secondary language: Persian", "Date & time: Tenant default"]);
  } else if (activeSection === "appearance") {
    detailPanel = renderInfoPanel("Appearance", "Keep the shell minimal and consistent across the console.", ["Theme mode: Light", "Density: Comfortable", "Navigation style: Compact sidebar"]);
  } else if (activeSection === "notifications") {
    detailPanel = renderInfoPanel("Notifications", "Review how platform activity reaches users.", ["In-app alerts enabled", "Email digest for approvals", "Escalation alerts for operations"]);
  } else if (activeSection === "whatsapp") {
    detailPanel = renderInfoPanel("WhatsApp", "Prepare messaging defaults before connecting live channels.", ["Default sender profile", "Template approval flow", "Conversation assignment rules"]);
  } else if (activeSection === "ai") {
    detailPanel = renderInfoPanel("Ameen AI", "Centralize assistant behavior and AI-facing defaults.", ["Assistant persona presets", "Tenant-safe tool policies", "Prompt library governance"]);
  } else if (activeSection === "backup") {
    detailPanel = renderInfoPanel("Backup & Restore", "Keep recovery tasks deliberate and auditable.", ["Nightly backups", "Export verification", "Restore runbook checklist"]);
  } else if (activeSection === "accounting") {
    detailPanel = renderInfoPanel("Accounting", "Reserve this area for finance-specific controls and policies.", ["Chart of accounts defaults", "Tax handling policy", "Posting approval gates"]);
  } else if (activeSection === "workflow") {
    detailPanel = renderInfoPanel("Workflow", "Collect workflow-wide controls in one place before module-specific automation screens.", ["Approval paths", "Escalation windows", "Workflow ownership mapping"]);
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-border/70 bg-background px-6 py-5 shadow-sm lg:px-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            A minimal control surface for account, workspace, and operational preferences.
          </p>
        </div>
      </section>

      {groupedCards.map(([group, cards]) => (
        <section key={group} className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-foreground">{group}</h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;
              const isActive = activeSection === card.id;

              return (
                <Link
                  key={card.id}
                  href={card.href}
                  className={cn(
                    "group flex min-h-40 flex-col justify-between rounded-lg border border-border/70 bg-background p-5 shadow-sm transition-colors hover:border-foreground/15 hover:bg-muted/10",
                    isActive && "border-foreground/20 bg-muted/10",
                  )}
                >
                  <div className="space-y-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-background group-hover:text-foreground">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <p className="text-base font-semibold text-foreground">{card.title}</p>
                        {card.badge && (
                          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                            {card.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">{card.description}</p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                    Open section
                    <HiMiniArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      {detailPanel}
    </div>
  );
}
