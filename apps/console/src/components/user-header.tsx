"use client";

import { useTransition, useState } from "react";
import { FiChevronDown, FiLogOut } from "react-icons/fi";
import { HiMiniSparkles } from "react-icons/hi2";
import { logoutAction } from "@/actions/auth";

interface Props {
  user: { name: string; email: string; isSuperAdmin: boolean };
}

export function UserHeader({ user }: Props) {
  const [open, setOpen]            = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted text-slate-700">
          <HiMiniSparkles className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-700">SBC ERP</p>
          <p className="text-sm text-muted-foreground">Everything in one place</p>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setOpen((p) => !p)}
          className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted text-xs font-semibold text-slate-700">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div className="max-w-[160px] text-left">
            <span className="block truncate font-semibold text-slate-900">{user.name}</span>
            <span className="block truncate text-xs text-slate-500">{user.email}</span>
          </div>
          {user.isSuperAdmin && (
            <span className="rounded-full border border-border bg-muted px-2 py-1 text-[11px] font-semibold text-slate-700">Admin</span>
          )}
          <FiChevronDown className="h-4 w-4 text-slate-400" />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-2xl border border-border bg-background p-2">
              <div className="rounded-xl border border-border bg-muted/40 px-4 py-4">
                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
              <div className="p-1.5">
                <button
                  disabled={pending}
                  onClick={() => startTransition(() => logoutAction())}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600">
                    <FiLogOut className="h-4 w-4" />
                  </span>
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
