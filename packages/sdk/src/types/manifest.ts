export interface PermissionDescriptor {
  key:   string;
  label: string;
}

export interface MenuItemDescriptor {
  key:        string;
  label:      string;
  icon?:      string;
  href?:      string;
  order?:     number;
  permission?: string;
  children?:  MenuItemDescriptor[];
}

export interface RouteDescriptor {
  path:    string;
  handler: string;
  type:    "page" | "api" | "layout" | "middleware";
  meta?: {
    permission?: string;
    layout?:     string;
  };
}

export interface EventsDescriptor {
  emits:   string[];
  listens: string[];
}

export interface SettingDescriptor {
  key:     string;
  label:   string;
  type:    "string" | "number" | "boolean" | "select" | "json";
  scope:   "system" | "tenant" | "user";
  default?: unknown;
  options?: { value: string; label: string }[];
}

export interface SlotDescriptor {
  slot:      string;
  component: string;
}

export interface HooksDescriptor {
  pre_install?:    string;
  post_install?:   string;
  pre_upgrade?:    string;
  post_upgrade?:   string;
  pre_uninstall?:  string;
  post_uninstall?: string;
}

export interface ModuleManifest {
  name:             string;
  title:            string;
  description?:     string;
  version:          string;
  author?:          string;
  category?:        string;

  depends?:          string[];
  optional_depends?: string[];
  conflicts?:        string[];

  permissions?: PermissionDescriptor[];
  menus?:       MenuItemDescriptor[];
  routes?:      RouteDescriptor[];
  events?:      EventsDescriptor;
  settings?:    SettingDescriptor[];
  slots?:       SlotDescriptor[];

  migrations?: string;
  seed?:       string;
  hooks?:      HooksDescriptor;

  auto_install?: boolean;
  installable?:  boolean;
  application?:  boolean;
}
