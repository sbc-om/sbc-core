/**
 * Dashboard widget registry.
 *
 * Each installed module that wants a dashboard widget exports a loader here.
 * The loader receives the tenant ID and returns structured widget data that
 * the generic WidgetCard can render.
 *
 * Adding a new module widget: add one entry to MODULE_WIDGET_LOADERS below.
 */

import type { BitcoinMarketSnapshot } from "@/../external-modules/bitcoin_market/src";

export interface WidgetStat {
  label: string;
  value: number | string;
}

export interface WidgetBadge {
  label: string;
  tone: "default" | "success" | "danger";
}

export interface WidgetMeta {
  left: string;
  leftLabel: string;
  right: string;
  rightLabel: string;
}

export interface WidgetData {
  moduleName: string;
  title:      string;
  icon:       string;       // key into MODULE_ICONS map
  href:       string;       // link destination
  primary:    number | string;
  primaryLabel: string;     // label under the big number
  stats:      WidgetStat[]; // secondary stats row
  badge?:     WidgetBadge;
  accentTone?: "default" | "success" | "danger";
  sparkline?: number[];
  meta?:      WidgetMeta;
  liveSnapshot?: BitcoinMarketSnapshot;
}

type WidgetLoader = (tenantId: string) => Promise<WidgetData>;

export const MODULE_WIDGET_LOADERS: Record<string, WidgetLoader> = {
  contacts: async (tenantId) => {
    const { getContactsWidgetData } = await import("@sbc/module-contacts/services");
    const data = await getContactsWidgetData(tenantId);
    return {
      moduleName:   "contacts",
      title:        "Contacts",
      icon:         "identification",
      href:         "/contacts",
      primary:      data.total,
      primaryLabel: "total contacts",
      stats: [
        { label: "With email", value: data.withEmail },
        { label: "With phone", value: data.withPhone },
      ],
    };
  },
  bitcoin_market: async () => {
    const { getBitcoinWidgetData } = await import("@/../external-modules/bitcoin_market/src");
    return getBitcoinWidgetData();
  },
};
