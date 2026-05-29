import Link from "next/link";
import { notFound } from "next/navigation";
import { HiArrowLeft } from "react-icons/hi2";
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

  const tenantId = user.tenantId ?? "00000000-0000-0000-0000-000000000001";

  const avatarLink = await getLatestDocumentLink({
    tenantId,
    resourceModule: "iam",
    resourceType: "user",
    resourceId: user.id,
    fieldName: "avatar",
  });

  const avatarDocument = avatarLink
    ? await getDocumentById(avatarLink.documentId, tenantId)
    : null;

  const linkedDocuments = await listLinkedDocuments({
    tenantId,
    resourceModule: "iam",
    resourceType: "user",
    resourceId: user.id,
  });

  async function updateWithId(formData: FormData) {
    "use server";
    await updateConsoleUserAction(id, formData);
  }

  const initialAvatar: FileManagerItem | null = avatarDocument
    ? {
        id:           avatarDocument.id,
        title:        avatarDocument.title,
        originalName: avatarDocument.originalName,
        folder:       avatarDocument.folder,
        moduleName:   avatarDocument.moduleName,
        mimeType:     avatarDocument.mimeType,
        extension:    avatarDocument.extension,
        sizeBytes:    avatarDocument.sizeBytes,
        tags:         avatarDocument.tags,
        createdAt:    avatarDocument.createdAt.toISOString(),
      }
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/users"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <HiArrowLeft className="h-3.5 w-3.5" />
          Users
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-sm font-semibold text-foreground">{user.name}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-background p-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Profile</h2>
          <ProfileForm
            user={{ id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl }}
            initialAvatar={initialAvatar}
            action={updateWithId}
          />
        </section>

        <section className="rounded-lg border border-border bg-background p-6">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">Roles</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Check roles to assign them to this user.</p>
          </div>
          <RoleAssignment
            userId={user.id}
            allRoles={allRoles}
            assignedRoles={user.roles}
          />
        </section>
      </div>

      <section className="rounded-lg border border-border bg-background p-6">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-foreground">Linked Files</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">File attachments linked to this user record.</p>
        </div>
        <LinkedAssetsManager
          items={linkedDocuments.map(({ link, document }) => ({
            link: {
              id:         link.id,
              fieldName:  link.fieldName,
              linkLabel:  link.linkLabel,
              visibility: link.visibility as "internal" | "tenant" | "public",
              sortOrder:  link.sortOrder,
            },
            document: {
              id:           document.id,
              title:        document.title,
              originalName: document.originalName,
              folder:       document.folder,
              sizeBytes:    document.sizeBytes,
            },
          }))}
          tenantId={tenantId}
          resourcePath={`/users/${user.id}`}
          resourceModule="iam"
          resourceType="user"
          resourceId={user.id}
        />
      </section>

      <div className="rounded-lg border border-border bg-background p-4">
        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
          <div>
            <p className="font-medium text-foreground">Status</p>
            <p className="mt-0.5 text-muted-foreground">{user.isActive ? "Active" : "Inactive"}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Super Admin</p>
            <p className="mt-0.5 text-muted-foreground">{user.isSuperAdmin ? "Yes" : "No"}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Created</p>
            <p className="mt-0.5 text-muted-foreground">{user.createdAt.toLocaleDateString()}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Last Login</p>
            <p className="mt-0.5 text-muted-foreground">
              {user.lastLoginAt ? user.lastLoginAt.toLocaleDateString() : "Never"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
