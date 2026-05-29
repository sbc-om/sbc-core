import { getBuiltinWidgetConfig } from "@/actions/builtin-widget-settings";
import { SYSTEM_TENANT_ID } from "@/lib/bootstrap";
import { getSessionUser } from "@/lib/session";
import { SettingsSectionShell } from "../_components/settings-section-shell";
import { WidgetSettings } from "../_components/widget-settings";

interface SearchParams {
  widgetCategory?: string | string[];
  widgetPage?: string | string[];
}

function getParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getPage(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function WidgetSettingsPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = (await searchParams) ?? {};
  const user = await getSessionUser();

  if (!user) {
    return null;
  }

  const tenantId = user.tenantId ?? SYSTEM_TENANT_ID;
  const widgetConfig = (await getBuiltinWidgetConfig(user.id)) ?? [];

  return (
    <SettingsSectionShell
      title="Widgets"
      description="Manage dashboard widgets in a dedicated settings page."
    >
      <WidgetSettings
        userId={user.id}
        tenantId={tenantId}
        initialConfig={widgetConfig}
        activeCategory={getParam(params.widgetCategory) ?? "all"}
        currentPage={getPage(getParam(params.widgetPage))}
        basePath="/settings/widgets"
      />
    </SettingsSectionShell>
  );
}