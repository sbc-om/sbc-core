import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserWithRoles } from "@sbc/module-iam/services";
import { listRoles } from "@sbc/module-iam/services";
import { getDocumentById, getLatestDocumentLink, listLinkedDocuments } from "@sbc/module-documents/services";
import type { FileManagerItem } from "@/components/documents/types";
import { RoleAssignment } from "./_components/role-assignment";
import { LinkedAssetsManager } from "./_components/linked-assets-manager";
import { ProfileForm } from "./_components/profile-form";
import { updateConsoleUserAction } from "@/actions/users";

interface Props { params: Promise<{ id: string }> }

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params;
  const [user, allRoles] = await Promise.all([getUserWithRoles(id), listRoles()]);
  if (!user) notFound();

  const avatarLink = await getLatestDocumentLink({
    tenantId: user.tenantId ?? "00000000-0000-0000-0000-000000000001",
    resourceModule: "iam",
    resourceType: "user",
    resourceId: user.id,
    fieldName: "avatar",
  });

  const avatarDocument = avatarLink
    ? await getDocumentById(avatarLink.documentId, user.tenantId ?? "00000000-0000-0000-0000-000000000001")
    : null;
  const linkedDocuments = await listLinkedDocuments({
    tenantId: user.tenantId ?? "00000000-0000-0000-0000-000000000001",
    resourceModule: "iam",
    resourceType: "user",
    resourceId: user.id,
  });
  const tenantId = user.tenantId ?? "00000000-0000-0000-0000-000000000001";

  async function updateWithId(formData: FormData) {
    "use server";
    await updateConsoleUserAction(id, formData);
  }

  const initialAvatar: FileManagerItem | null = avatarDocument
    ? {
        id: avatarDocument.id,
        title: avatarDocument.title,
        originalName: avatarDocument.originalName,
        folder: avatarDocument.folder,
        moduleName: avatarDocument.moduleName,
        mimeType: avatarDocument.mimeType,
        extension: avatarDocument.extension,
        sizeBytes: avatarDocument.sizeBytes,
        tags: avatarDocument.tags,
        createdAt: avatarDocument.createdAt.toISOString(),
      }
    : null;

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
          <ProfileForm user={user} initialAvatar={initialAvatar} action={updateWithId} />
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
      <section className="rounded-lg border border-border p-6 space-y-4">
        <div>
          <h3 className="font-semibold">Linked Assets</h3>
          <p className="text-sm text-muted-foreground">Structured document relations attached to this user record.</p>
        </div>
        <LinkedAssetsManager
          items={linkedDocuments.map(({ link, document }) => ({
            link: {
              id: link.id,
              fieldName: link.fieldName,
              linkLabel: link.linkLabel,
              visibility: link.visibility as "internal" | "tenant" | "public",
              sortOrder: link.sortOrder,
            },
            document: {
              id: document.id,
              title: document.title,
              originalName: document.originalName,
              folder: document.folder,
              sizeBytes: document.sizeBytes,
            },
          }))}
          tenantId={tenantId}
          resourcePath={`/users/${user.id}`}
          resourceModule="iam"
          resourceType="user"
          resourceId={user.id}
        />
      </section>

      <div className="rounded-lg border border-border p-4 text-xs text-muted-foreground grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div><span className="font-medium block">Status</span>{user.isActive ? "Active" : "Inactive"}</div>
        <div><span className="font-medium block">Super Admin</span>{user.isSuperAdmin ? "Yes" : "No"}</div>
        <div><span className="font-medium block">Created</span>{user.createdAt.toLocaleString()}</div>
        <div><span className="font-medium block">Last Login</span>{user.lastLoginAt ? user.lastLoginAt.toLocaleString() : "Never"}</div>
      </div>
    </div>
  );
}
