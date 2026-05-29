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

  if (allRoles.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No roles available. Create roles first.</p>
    );
  }

  return (
    <div className="space-y-1.5">
      {allRoles.map((role) => {
        const assigned = assignedIds.has(role.id);
        return (
          <label
            key={role.id}
            className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3 transition-colors hover:bg-muted/30"
          >
            <input
              type="checkbox"
              checked={assigned}
              disabled={pending}
              onChange={() => toggle(role.id, assigned)}
              className="h-4 w-4 rounded accent-primary"
            />
            <div>
              <p className="text-sm font-medium text-foreground">{role.label}</p>
              <p className="font-mono text-xs text-muted-foreground">{role.name}</p>
            </div>
          </label>
        );
      })}
    </div>
  );
}
