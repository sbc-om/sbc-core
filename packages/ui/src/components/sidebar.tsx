"use client";

import * as React from "react";
import {
  HiChevronDown,
  HiChevronRight,
  HiMiniChartBar,
  HiMiniCog6Tooth,
  HiMiniCube,
  HiMiniShieldCheck,
  HiMiniUserGroup,
} from "react-icons/hi2";
import { PiScrollDuotone } from "react-icons/pi";
import type { IconType } from "react-icons";
import { cn } from "../lib/utils";

const iconMap: Record<string, IconType> = {
  LayoutDashboard: HiMiniChartBar,
  Settings2: HiMiniCog6Tooth,
  Package: HiMiniCube,
  Users: HiMiniUserGroup,
  ShieldCheck: HiMiniShieldCheck,
  ScrollText: PiScrollDuotone,
  SlidersHorizontal: HiMiniCog6Tooth,
};

export interface SidebarMenuItem {
  key:      string;
  label:    string;
  icon?:    string | null;
  href?:    string | null;
  order:    number;
  children: SidebarMenuItem[];
}

interface SidebarItemProps {
  item:        SidebarMenuItem;
  depth?:      number;
  pathname?:   string | undefined;
  LinkComponent?: React.ComponentType<{ href: string; className?: string; children: React.ReactNode }> | undefined;
}

function SidebarItem({ item, depth = 0, pathname, LinkComponent }: SidebarItemProps) {
  const [expanded, setExpanded] = React.useState(false);
  const hasChildren = item.children.length > 0;
  const isActive   = !!item.href && item.href === pathname;
  const paddingLeft = `${(depth + 1) * 0.75}rem`;
  const Icon = item.icon ? iconMap[item.icon] : undefined;

  const itemClass = cn(
    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground",
    "transition-colors duration-200 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
    isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-semibold",
    depth === 0 && !isActive && "font-medium"
  );

  const Label = (
    <>
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-base text-sidebar-foreground/80",
          isActive && "border-white/20 bg-white/10 text-sidebar-accent-foreground"
        )}
      >
        {Icon ? <Icon className="h-5 w-5" /> : <HiMiniCube className="h-5 w-5" />}
      </span>
      <span className="flex-1 truncate text-left leading-tight">{item.label}</span>
    </>
  );

  return (
    <li>
      {/* Accordion toggle for parent items */}
      {hasChildren ? (
        <button
          onClick={() => setExpanded((p) => !p)}
          style={{ paddingLeft }}
          className={itemClass}
        >
          {Label}
          {expanded
            ? <HiChevronDown className="h-4 w-4 shrink-0 opacity-70" />
            : <HiChevronRight className="h-4 w-4 shrink-0 opacity-70" />}
        </button>
      ) : item.href ? (
        /* Leaf items with href — use LinkComponent or plain <a> */
        LinkComponent ? (
          <LinkComponent href={item.href} className={cn(itemClass, "block")} >
            <span style={{ paddingLeft: paddingLeft }} className="flex w-full items-center gap-3">
              {Label}
            </span>
          </LinkComponent>
        ) : (
          <a
            href={item.href}
            style={{ paddingLeft }}
            className={itemClass}
          >
            {Label}
          </a>
        )
      ) : (
        /* Label-only, no href, no children */
        <span style={{ paddingLeft }} className={cn(itemClass, "cursor-default opacity-60")}>
          {Label}
        </span>
      )}

      {/* Children */}
      {hasChildren && expanded && (
        <ul>
          {item.children
            .sort((a, b) => a.order - b.order)
            .map((child) => (
              <SidebarItem
                key={child.key}
                item={child}
                depth={depth + 1}
                pathname={pathname}
                LinkComponent={LinkComponent}
              />
            ))}
        </ul>
      )}
    </li>
  );
}

export interface SidebarProps {
  menus:          SidebarMenuItem[];
  appName?:       string;
  pathname?:      string | undefined;
  className?:     string;
  LinkComponent?: React.ComponentType<{ href: string; className?: string; children: React.ReactNode }> | undefined;
}

export function Sidebar({ menus, appName = "SBC", pathname, LinkComponent, className }: SidebarProps) {
  return (
    <aside className={cn("flex h-full w-72 flex-col border-r border-sidebar-border bg-sidebar", className)}>
      <div className="border-b border-sidebar-border px-5 py-5">
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sidebar-foreground">
            <HiMiniChartBar className="h-6 w-6" />
          </span>
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-sidebar-foreground/50">Control Center</p>
            <span className="text-lg font-semibold text-sidebar-foreground">{appName}</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-2">
          {menus
            .sort((a, b) => a.order - b.order)
            .map((item) => (
              <SidebarItem
                key={item.key}
                item={item}
                pathname={pathname}
                LinkComponent={LinkComponent}
              />
            ))}
        </ul>
      </nav>
    </aside>
  );
}
