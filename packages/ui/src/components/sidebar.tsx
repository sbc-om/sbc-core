"use client";

import React from "react";
import {
  HiChevronDown,
  HiChevronRight,
  HiMiniChartBar,
  HiMiniCog6Tooth,
  HiMiniCube,
  HiMiniFolderOpen,
  HiMiniIdentification,
  HiMiniShieldCheck,
  HiMiniShoppingBag,
  HiMiniUserGroup,
  HiMiniXMark,
} from "react-icons/hi2";
import { PiScrollDuotone } from "react-icons/pi";
import type { IconType } from "react-icons";
import { cn } from "../lib/utils";

const iconMap: Record<string, IconType> = {
  LayoutDashboard:  HiMiniChartBar,
  Settings2:        HiMiniCog6Tooth,
  Package:          HiMiniCube,
  FolderOpen:       HiMiniFolderOpen,
  Identification:   HiMiniIdentification,
  Users:            HiMiniUserGroup,
  ShieldCheck:      HiMiniShieldCheck,
  ScrollText:       PiScrollDuotone,
  SlidersHorizontal: HiMiniCog6Tooth,
  Store:            HiMiniShoppingBag,
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
  item:           SidebarMenuItem;
  depth?:         number;
  pathname?:      string | undefined;
  LinkComponent?: React.ComponentType<{ href: string; className?: string; children: React.ReactNode }> | undefined;
}

function SidebarItem({ item, depth = 0, pathname, LinkComponent }: SidebarItemProps) {
  const [expanded, setExpanded] = React.useState(false);
  const hasChildren = item.children.length > 0;
  const isActive   = !!item.href && item.href === pathname;
  const paddingLeft = `${(depth + 1) * 0.75}rem`;
  const Icon = item.icon ? iconMap[item.icon] : undefined;

  const itemClass = cn(
    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground",
    "transition-colors duration-150 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
    isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-semibold",
    depth === 0 && !isActive && "font-medium"
  );

  const Label = (
    <>
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-sm text-sidebar-foreground/80",
          isActive && "border-white/20 bg-white/10 text-sidebar-accent-foreground"
        )}
      >
        {Icon ? <Icon className="h-4 w-4" /> : <HiMiniCube className="h-4 w-4" />}
      </span>
      <span className="flex-1 truncate text-left leading-tight">{item.label}</span>
    </>
  );

  return (
    <li>
      {hasChildren ? (
        <button
          onClick={() => setExpanded((p) => !p)}
          style={{ paddingLeft }}
          className={itemClass}
        >
          {Label}
          {expanded
            ? <HiChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
            : <HiChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />}
        </button>
      ) : item.href ? (
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
        <span style={{ paddingLeft }} className={cn(itemClass, "cursor-default opacity-60")}>
          {Label}
        </span>
      )}

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
  onClose?:       () => void;
  LinkComponent?: React.ComponentType<{ href: string; className?: string; children: React.ReactNode }> | undefined;
}

export function Sidebar({ menus, appName = "SBC", pathname, LinkComponent, className, onClose }: SidebarProps) {
  return (
    <aside className={cn("flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar", className)}>
      <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-sidebar-foreground">
            <HiMiniChartBar className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-sidebar-foreground/40">Platform</p>
            <span className="text-sm font-semibold leading-none text-sidebar-foreground">{appName}</span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/50 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground lg:hidden"
            aria-label="Close sidebar"
          >
            <HiMiniXMark className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-0.5">
          {menus
            .sort((a, b) => a.order - b.order)
            .map((item, index, sorted) => {
              // Render a visual separator before the Administration group (order >= 90)
              const prevItem = sorted[index - 1];
              const isAdminBoundary =
                item.order >= 90 &&
                prevItem !== undefined &&
                prevItem.order < 90;

              return (
                <React.Fragment key={item.key}>
                  {isAdminBoundary && (
                    <li role="separator" className="mx-2 my-2 h-px bg-sidebar-border/60" />
                  )}
                  <SidebarItem
                    item={item}
                    pathname={pathname}
                    LinkComponent={LinkComponent}
                  />
                </React.Fragment>
              );
            })}
        </ul>
      </nav>
    </aside>
  );
}
