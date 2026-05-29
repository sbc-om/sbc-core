export interface BuiltinWidgetDef {
  id: string;
  label: string;
  description: string;
  category: string;
  /** wigggle-ui size token */
  size: "sm" | "md" | "lg";
  /** true = dashboard page must fetch and pass server data */
  needsServerData: boolean;
}

export const BUILTIN_WIDGETS: BuiltinWidgetDef[] = [
  {
    id: "clock",
    label: "Clock",
    description: "Live digital clock showing the current time.",
    category: "General",
    size: "sm",
    needsServerData: false,
  },
  {
    id: "calendar",
    label: "Calendar",
    description: "Current date with day name and month.",
    category: "General",
    size: "sm",
    needsServerData: false,
  },
  {
    id: "stat-modules",
    label: "Installed Modules",
    description: "Number of installed and active modules.",
    category: "Platform",
    size: "sm",
    needsServerData: true,
  },
  {
    id: "stat-users",
    label: "Active Users",
    description: "Count of active platform users.",
    category: "Platform",
    size: "sm",
    needsServerData: true,
  },
  {
    id: "stat-events",
    label: "Pending Events",
    description: "Events waiting in the processing queue.",
    category: "Platform",
    size: "sm",
    needsServerData: true,
  },
  {
    id: "stat-audit",
    label: "Audit Today",
    description: "Audit log entries recorded today.",
    category: "Platform",
    size: "sm",
    needsServerData: true,
  },
];

export interface BuiltinWidgetConfig {
  id: string;
  enabled: boolean;
  order: number;
}

/** Server-fetched numeric stat for platform stat widgets */
export interface WidgetStatData {
  value: number;
  sub: string;
  icon: "cube" | "users" | "bolt" | "shield";
}
