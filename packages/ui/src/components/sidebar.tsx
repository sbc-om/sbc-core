"use client";

import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";

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
  pathname?:   string;
  LinkComponent?: React.ComponentType<{ href: string; className?: string; children: React.ReactNode }>;
}

function SidebarItem({ item, depth = 0, pathname, LinkComponent }: SidebarItemProps) {
  const [expanded, setExpanded] = React.useState(false);
  const hasChildren = item.children.length > 0;
  const isActive   = !!item.href && item.href === pathname;
  const paddingLeft = `${(depth + 1) * 0.75}rem`;

  const itemClass = cn(
    "flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-sidebar-foreground",
    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
    isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-semibold",
    depth === 0 && !isActive && "font-medium"
  );

  const Label = (
    <span className="flex-1 truncate text-left">{item.label}</span>
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
            ? <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            : <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />}
        </button>
      ) : item.href ? (
        /* Leaf items with href — use LinkComponent or plain <a> */
        LinkComponent ? (
          <LinkComponent href={item.href} className={cn(itemClass, "block")} >
            <span style={{ paddingLeft: paddingLeft }} className="flex items-center gap-2 w-full">
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
  pathname?:      string;
  className?:     string;
  LinkComponent?: React.ComponentType<{ href: string; className?: string; children: React.ReactNode }>;
}

export function Sidebar({ menus, appName = "SBC", pathname, LinkComponent, className }: SidebarProps) {
  return (
    <aside className={cn("flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border", className)}>
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <span className="text-lg font-bold text-sidebar-foreground">{appName}</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
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
