"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "@sbc/ui";
import type { SidebarProps } from "@sbc/ui";

type Props = Omit<SidebarProps, "pathname" | "LinkComponent">;

export function NavigationSidebar(props: Props) {
  const pathname = usePathname();
  return (
    <Sidebar
      {...props}
      pathname={pathname}
      LinkComponent={Link}
    />
  );
}
