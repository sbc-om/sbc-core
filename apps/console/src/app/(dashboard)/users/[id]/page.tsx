import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserWithRoles } from "@sbc/module-iam/services";
import { listRoles } from "@sbc/module-iam/services";
import { RoleAssignment } from "./_components/role-assignment";
import { updateUserAction } from "@sbc/module-iam/actions";

interface Props { params: Promise<{ id: string }> }

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params;
  const [user, allRoles] = await Promise.all([getUserWithRoles(id), listRoles()]);
  if (!user) notFound();

  async function updateWithId(formData: FormData) {
    "use server";
    await updateUserAction(id, formData);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/users" className="text-sm text-muted-foreground hover:text-foreground">← Users</Link>
        <span className="text-muted-foreground">/</span>
        <h2 className="text-lg font-semibold">{user.name}</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Edit profile */}
        <section className="rounded-lg border border-border p-6 space-y-4">
          <h3 className="font-semibold">Profile</h3>
          <form action={updateWithId} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Full Name</label>
              <input
                name="name"
                defaultValue={user.name}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                name="email"
                type="email"
                defaultValue={user.email}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">New Password <span className="text-muted-foreground font-normal">(leave blank to keep)</span></label>
              <input
                name="password"
                type="password"
                minLength={8}
                placeholder="••••••••"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Save Changes
            </button>
          </form>
        </section>

        {/* Role assignment */}
        <section className="rounded-lg border border-border p-6 space-y-4">
          <div>
            <h3 className="font-semibold">Roles</h3>
            <p className="text-sm text-muted-foreground">Check to assign a role to this user.</p>
          </div>
          <RoleAssignment
            userId={user.id}
            allRoles={allRoles}
            assignedRoles={user.roles}
          />
        </section>
      </div>

      {/* Info */}
      <div className="rounded-lg border border-border p-4 text-xs text-muted-foreground grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div><span className="font-medium block">Status</span>{user.isActive ? "Active" : "Inactive"}</div>
        <div><span className="font-medium block">Super Admin</span>{user.isSuperAdmin ? "Yes" : "No"}</div>
        <div><span className="font-medium block">Created</span>{user.createdAt.toLocaleString()}</div>
        <div><span className="font-medium block">Last Login</span>{user.lastLoginAt ? user.lastLoginAt.toLocaleString() : "Never"}</div>
      </div>
    </div>
  );
}
