import Link from "next/link";
import { HiArrowRight } from "react-icons/hi2";
import { listRoles } from "@sbc/module-iam/services";
import { CreateRoleDialog } from "./_components/create-role-dialog";
import { DeleteRoleButton } from "./_components/delete-role-button";

export default async function RolesPage() {
  const roles = await listRoles();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Roles & Permissions</h2>
          <p className="text-muted-foreground">Define roles and assign permissions to them.</p>
        </div>
        <CreateRoleDialog />
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        {roles.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No roles yet. Create the first one.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Identifier</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Permissions</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Users</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{role.label}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{role.name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                      {role.permissionCount} permissions
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                      {role.userCount} users
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {role.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 flex items-center gap-3">
                    <Link href={`/roles/${role.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                      Edit
                      <HiArrowRight className="h-4 w-4" />
                    </Link>
                    <DeleteRoleButton id={role.id} isSystem={role.isSystem} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
