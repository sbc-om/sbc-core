import Link from "next/link";
import { HiArrowRight, HiMiniShieldCheck } from "react-icons/hi2";
import { listRoles } from "@sbc/module-iam/services";
import { CreateRoleDialog } from "./_components/create-role-dialog";
import { DeleteRoleButton } from "./_components/delete-role-button";

export default async function RolesPage() {
  const roles = await listRoles();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Roles</h1>
          <p className="mt-1 text-sm text-muted-foreground">Define roles and assign permissions.</p>
        </div>
        <CreateRoleDialog />
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-background">
        {roles.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <HiMiniShieldCheck className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">No roles yet</p>
            <p className="text-xs text-muted-foreground">Create the first role to manage permissions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Identifier</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Permissions</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground sm:table-cell">Users</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground md:table-cell">Created</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {roles.map((role) => (
                  <tr key={role.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium text-foreground">{role.label}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{role.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {role.permissionCount}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className="inline-block rounded border border-purple-200 bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                        {role.userCount}
                      </span>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-muted-foreground md:table-cell">
                      {role.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/roles/${role.id}`}
                          className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-primary hover:underline"
                        >
                          Edit
                          <HiArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        <DeleteRoleButton id={role.id} isSystem={role.isSystem} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
