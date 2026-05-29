import Link from "next/link";
import { notFound } from "next/navigation";
import { HiArrowLeft } from "react-icons/hi2";
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
      <div className="flex items-center gap-2">
        <Link
          href="/roles"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <HiArrowLeft className="h-3.5 w-3.5" />
          Roles
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-sm font-semibold text-foreground">{role.label}</h1>
        <span className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
          {role.name}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-lg border border-border bg-background p-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Role Details</h2>
          <form action={updateWithId} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Display Name</label>
              <input
                name="label"
                defaultValue={role.label}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Save Changes
            </button>
          </form>

          <div className="mt-4 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Identifier</span>
              <span className="font-mono">{role.name}</span>
            </div>
            <div className="flex justify-between">
              <span>System role</span>
              <span>{role.isSystem ? "Yes" : "No"}</span>
            </div>
            <div className="flex justify-between">
              <span>Created</span>
              <span>{role.createdAt.toLocaleDateString()}</span>
            </div>
          </div>
        </section>

        <section className="col-span-2 rounded-lg border border-border bg-background p-6">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">Permissions</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
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
