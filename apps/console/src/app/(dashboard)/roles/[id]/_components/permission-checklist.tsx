"use client";

import { useState, useTransition } from "react";
import { setRolePermissionsAction } from "@sbc/module-iam/actions";

interface Permission { id: string; key: string; label: string; module: string }

interface Props {
  roleId:      string;
  all:         Permission[];
  assigned:    Permission[];
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

  // Group by module
  const byModule = new Map<string, Permission[]>();
  for (const p of all) {
    const arr = byModule.get(p.module) ?? [];
    arr.push(p);
    byModule.set(p.module, arr);
  }

  return (
    <div className="space-y-4">
      {Array.from(byModule.entries()).map(([mod, perms]) => (
        <div key={mod}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{mod}</p>
          <div className="space-y-1">
            {perms.map((p) => (
              <label key={p.id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted/30 transition-colors">
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggle(p.id)}
                  className="h-4 w-4 rounded accent-primary"
                />
                <div>
                  <span className="text-sm">{p.label}</span>
                  <span className="ml-2 font-mono text-xs text-muted-foreground">{p.key}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <button
          onClick={save}
          disabled={pending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {pending ? "Saving…" : "Save Permissions"}
        </button>
        {saved && <span className="text-sm text-green-600">Saved ✓</span>}
        <span className="text-xs text-muted-foreground">{selected.size} selected</span>
      </div>
    </div>
  );
}
