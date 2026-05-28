"use client";

import { useTransition, useState } from "react";
import { logoutAction } from "@/actions/auth";

interface Props {
  user: { name: string; email: string; isSuperAdmin: boolean };
}

export function UserHeader({ user }: Props) {
  const [open, setOpen]            = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      <p className="text-sm font-medium text-muted-foreground">SBC Core — Business Operating System</p>

      <div className="relative">
        <button
          onClick={() => setOpen((p) => !p)}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm hover:bg-muted transition-colors"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <span className="max-w-[140px] truncate font-medium">{user.name}</span>
          {user.isSuperAdmin && (
            <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-800">Admin</span>
          )}
          <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-lg border border-border bg-background shadow-lg">
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <div className="p-1">
                <button
                  disabled={pending}
                  onClick={() => startTransition(() => logoutAction())}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
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
