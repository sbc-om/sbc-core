"use client";

import { useTransition } from "react";
import { assignRoleAction, removeRoleAction } from "@sbc/module-iam/actions";

interface Role { id: string; name: string; label: string }

interface Props {
  userId:        string;
  allRoles:      Role[];
  assignedRoles: Role[];
}

export function RoleAssignment({ userId, allRoles, assignedRoles }: Props) {
  const [pending, startTransition] = useTransition();
  const assignedIds = new Set(assignedRoles.map((r) => r.id));

  function toggle(roleId: string, currentlyAssigned: boolean) {
    startTransition(async () => {
      if (currentlyAssigned) {
        await removeRoleAction(userId, roleId);
      } else {
        await assignRoleAction(userId, roleId);
      }
    });
  }

  return (
    <div className="space-y-2">
      {allRoles.length === 0 ? (
        <p className="text-sm text-muted-foreground">No roles available. Create roles first.</p>
      ) : (
        allRoles.map((role) => {
          const assigned = assignedIds.has(role.id);
          return (
            <label
              key={role.id}
              className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3 hover:bg-muted/30 transition-colors"
            >
              <input
                type="checkbox"
                checked={assigned}
                disabled={pending}
                onChange={() => toggle(role.id, assigned)}
                className="h-4 w-4 rounded accent-primary"
              />
              <div>
                <p className="text-sm font-medium">{role.label}</p>
                <p className="text-xs text-muted-foreground font-mono">{role.name}</p>
              </div>
            </label>
          );
        })
      )}
    </div>
  );
}
