"use client";

import * as React from "react";
import { ChevronDown, ChevronRight, type LucideIcon } from "lucide-react";
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
  item:     SidebarMenuItem;
  depth?:   number;
  onNavigate?: (href: string) => void;
}

function SidebarItem({ item, depth = 0, onNavigate }: SidebarItemProps) {
  const [expanded, setExpanded] = React.useState(false);
  const hasChildren = item.children.length > 0;
  const paddingLeft = `${(depth + 1) * 0.75}rem`;

  function handleClick() {
    if (hasChildren) {
      setExpanded((prev) => !prev);
    } else if (item.href && onNavigate) {
      onNavigate(item.href);
    }
  }

  return (
    <li>
      <button
        onClick={handleClick}
        style={{ paddingLeft }}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-sidebar-foreground",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
          depth === 0 && "font-medium"
        )}
      >
        <span className="flex-1 truncate text-left">{item.label}</span>
        {hasChildren && (
          expanded
            ? <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            : <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
        )}
      </button>

      {hasChildren && expanded && (
        <ul>
          {item.children
            .sort((a, b) => a.order - b.order)
            .map((child) => (
              <SidebarItem
                key={child.key}
                item={child}
                depth={depth + 1}
                onNavigate={onNavigate}
              />
            ))}
        </ul>
      )}
    </li>
  );
}

export interface SidebarProps {
  menus:       SidebarMenuItem[];
  appName?:    string;
  onNavigate?: (href: string) => void;
  className?:  string;
}

export function Sidebar({ menus, appName = "SBC", onNavigate, className }: SidebarProps) {
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
              <SidebarItem key={item.key} item={item} onNavigate={onNavigate} />
            ))}
        </ul>
      </nav>
    </aside>
  );
}
