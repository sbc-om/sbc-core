import Link from "next/link";
import { notFound } from "next/navigation";
import { getRoleWithPermissions, listAllPermissions } from "@sbc/module-iam/services";
import { PermissionChecklist } from "./_components/permission-checklist";
import { updateRoleAction } from "@sbc/module-iam/actions";

interface Props { params: Promise<{ id: string }> }

export default async function RoleDetailPage({ params }: Props) {
  const { id } = await params;
  const [role, allPermissions] = await Promise.all([
    getRoleWithPermissions(id),
    listAllPermissions(),
  ]);
  if (!role) notFound();

  async function updateWithId(formData: FormData) {
    "use server";
    await updateRoleAction(id, formData);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/roles" className="text-sm text-muted-foreground hover:text-foreground">← Roles</Link>
        <span className="text-muted-foreground">/</span>
        <h2 className="text-lg font-semibold">{role.label}</h2>
        <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">{role.name}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Edit label */}
        <section className="rounded-lg border border-border p-6 space-y-4">
          <h3 className="font-semibold">Role Details</h3>
          <form action={updateWithId} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Display Label</label>
              <input
                name="label"
                defaultValue={role.label}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Save
            </button>
          </form>

          <div className="pt-2 text-xs text-muted-foreground space-y-1 border-t border-border">
            <div><span className="font-medium">Identifier: </span>{role.name}</div>
            <div><span className="font-medium">System role: </span>{role.isSystem ? "Yes" : "No"}</div>
            <div><span className="font-medium">Created: </span>{role.createdAt.toLocaleString()}</div>
          </div>
        </section>

        {/* Permission assignment */}
        <section className="col-span-2 rounded-lg border border-border p-6 space-y-4">
          <div>
            <h3 className="font-semibold">Permissions</h3>
            <p className="text-sm text-muted-foreground">
              {allPermissions.length} permissions across all modules.
            </p>
          </div>
          <PermissionChecklist
            roleId={role.id}
            all={allPermissions}
            assigned={role.permissions}
          />
        </section>
      </div>
    </div>
  );
}
