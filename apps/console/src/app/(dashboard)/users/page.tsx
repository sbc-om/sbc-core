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
      <div className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-border bg-background p-6">
        <div>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted text-slate-700">
            <HiMiniUserGroup className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">Users</h2>
          <p className="mt-2 text-sm text-slate-600">Manage platform users and access.</p>
        </div>
        <CreateUserDialog />
      </div>

      <div className="overflow-hidden rounded-[1.25rem] border border-border bg-background">
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
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-slate-700">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <span>
                        {user.name}
                      </span>
                    </div>
                    {user.isSuperAdmin && (
                      <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">Super Admin</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <ToggleActiveButton id={user.id} isActive={user.isActive} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {user.lastLoginAt ? user.lastLoginAt.toLocaleDateString() : "Not available"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {user.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/users/${user.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                      Manage
                      <HiArrowRight className="h-4 w-4" />
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
