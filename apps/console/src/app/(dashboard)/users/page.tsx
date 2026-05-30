import Link from "next/link";
import { HiArrowRight, HiMiniUserGroup } from "react-icons/hi2";
import { listUsers } from "@sbc/module-iam/services";
import { buildDocumentUrl, extractDocumentId } from "@/lib/documents";
import { CreateUserDialog } from "./_components/create-user-dialog";
import { ToggleActiveButton } from "./_components/toggle-active-button";

export default async function UsersPage() {
  const users = await listUsers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage platform users and their access.</p>
        </div>
        <CreateUserDialog />
      </div>

      <div className="app-surface overflow-hidden">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <HiMiniUserGroup className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">No users yet</p>
            <p className="text-xs text-muted-foreground">Create the first user to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground md:table-cell">Last Login</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground sm:table-cell">Created</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {extractDocumentId(user.avatarUrl) ? (
                          <img
                            src={buildDocumentUrl(extractDocumentId(user.avatarUrl)!, {
                              resourceModule: "iam",
                              resourceType: "user",
                              resourceId: user.id,
                              fieldName: "avatar",
                            })}
                            alt={user.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="app-avatar-chip h-8 w-8 shrink-0 rounded-full text-xs font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          {user.isSuperAdmin && (
                            <span className="app-badge app-badge-subtle inline-flex">
                              Super Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      <ToggleActiveButton id={user.id} isActive={user.isActive} />
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-muted-foreground md:table-cell">
                      {user.lastLoginAt ? user.lastLoginAt.toLocaleDateString() : "Never"}
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-muted-foreground sm:table-cell">
                      {user.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/users/${user.id}`}
                        className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-primary hover:underline"
                      >
                        Manage
                        <HiArrowRight className="h-3.5 w-3.5" />
                      </Link>
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
