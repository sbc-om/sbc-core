"use client";

import { useTransition, useState } from "react";
import { HiMiniChevronUpDown, HiBars3, HiArrowRightOnRectangle } from "react-icons/hi2";
import { logoutAction } from "@/actions/auth";
import { ThemeToggle } from "./theme-toggle";

interface Props {
  user:          { name: string; email: string; isSuperAdmin: boolean };
  onMenuToggle?: () => void;
}

export function UserHeader({ user, onMenuToggle }: Props) {
  const [open, setOpen]            = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
          aria-label="Toggle sidebar"
        >
          <HiBars3 className="h-5 w-5" />
        </button>
      </div>

      <div className="relative ml-auto">
        <div className="flex items-center gap-2">
          <ThemeToggle compact />
          <button
            onClick={() => setOpen((p) => !p)}
            className="flex h-10 items-center gap-2 rounded-md border border-border bg-background px-2.5 text-sm shadow-sm transition-colors hover:bg-muted"
          >
            <span className="app-avatar-chip h-7 w-7 rounded-md text-xs font-semibold text-foreground">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <span className="hidden max-w-[140px] truncate font-medium text-foreground sm:block">
              {user.name}
            </span>
            {user.isSuperAdmin && (
              <span className="app-badge app-badge-muted hidden sm:inline-flex">
                Admin
              </span>
            )}
            <HiMiniChevronUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-20 mt-1.5 w-60 rounded-lg border border-border bg-background shadow-lg">
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-semibold text-foreground">{user.name}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div className="p-1.5">
                <button
                  disabled={pending}
                  onClick={() => startTransition(() => logoutAction())}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-50"
                >
                  <HiArrowRightOnRectangle className="h-4 w-4" />
                  {pending ? "Signing out…" : "Sign out"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
