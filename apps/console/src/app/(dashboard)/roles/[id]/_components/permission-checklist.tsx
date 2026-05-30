"use client";

import { useState, useTransition } from "react";
import { HiMiniCheck } from "react-icons/hi2";
import { setRolePermissionsAction } from "@sbc/module-iam/actions";

interface Permission { id: string; key: string; label: string; module: string }

interface Props {
  roleId:   string;
  all:      Permission[];
  assigned: Permission[];
}

export function PermissionChecklist({ roleId, all, assigned }: Props) {
  const [selected, setSelected]    = useState(new Set(assigned.map((p) => p.id)));
  const [pending, startTransition] = useTransition();
  const [saved, setSaved]          = useState(false);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setSaved(false);
  }

  function save() {
    startTransition(async () => {
      await setRolePermissionsAction(roleId, Array.from(selected));
      setSaved(true);
    });
  }

  const byModule = new Map<string, Permission[]>();
  for (const p of all) {
    const arr = byModule.get(p.module) ?? [];
    arr.push(p);
    byModule.set(p.module, arr);
  }

  return (
    <div className="space-y-5">
      {Array.from(byModule.entries()).map(([mod, perms]) => (
        <div key={mod}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {mod}
          </p>
          <div className="space-y-0.5">
            {perms.map((p) => (
              <label
                key={p.id}
                className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/30"
              >
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggle(p.id)}
                  className="h-4 w-4 rounded accent-primary"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-sm text-foreground">{p.label}</span>
                  <span className="ml-2 font-mono text-xs text-muted-foreground">{p.key}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center">
        <button
          onClick={save}
          disabled={pending}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 sm:w-auto"
        >
          {pending ? "Saving…" : "Save Permissions"}
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
            <HiMiniCheck className="h-3.5 w-3.5" />
            Saved
          </span>
        )}
        <span className="text-xs text-muted-foreground sm:ml-auto">{selected.size} selected</span>
      </div>
    </div>
  );
}
