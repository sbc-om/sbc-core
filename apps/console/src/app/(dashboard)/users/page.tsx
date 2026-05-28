import Link from "next/link";
import { listUsers } from "@sbc/module-iam/services";
import { CreateUserDialog } from "./_components/create-user-dialog";
import { ToggleActiveButton } from "./_components/toggle-active-button";

export default async function UsersPage() {
  const users = await listUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">Manage platform users and access.</p>
        </div>
        <CreateUserDialog />
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        {users.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground text-sm">No users yet. Create the first one.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Last Login</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">
                    {user.name}
                    {user.isSuperAdmin && (
                      <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">Super Admin</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <ToggleActiveButton id={user.id} isActive={user.isActive} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {user.lastLoginAt ? user.lastLoginAt.toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {user.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/users/${user.id}`} className="text-xs text-primary hover:underline">
                      Manage →
                    </Link>
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
