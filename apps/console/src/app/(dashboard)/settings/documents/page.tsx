import { redirect } from "next/navigation";
import { FileManager } from "@/components/documents/file-manager";
import { FilePickerDemo } from "@/components/documents/file-picker-demo";
import type { FileManagerItem } from "@/components/documents/types";
import {
  getTenantIdForUser,
  hasPermissionForUser,
  requirePermissionForUser,
} from "@/lib/authorization";
import { getSessionUser } from "@/lib/session";
import { getDocumentStats, listDocuments } from "@sbc/module-documents/services";
import { SettingsSectionShell } from "../_components/settings-section-shell";

function serializeFile(file: Awaited<ReturnType<typeof listDocuments>>[number]): FileManagerItem {
  return {
    id: file.id,
    title: file.title,
    originalName: file.originalName,
    folder: file.folder,
    moduleName: file.moduleName,
    mimeType: file.mimeType,
    extension: file.extension,
    sizeBytes: file.sizeBytes,
    tags: file.tags,
    createdAt: file.createdAt.toISOString(),
  };
}

export default async function DocumentsSettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  try {
    await requirePermissionForUser(user, "documents.files.view");
  } catch {
    return (
      <SettingsSectionShell
        title="Documents"
        description="Access the shared file manager and linked documents from settings."
      >
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-lg font-semibold text-amber-900">Access Denied</h2>
          <p className="mt-2 text-sm leading-relaxed text-amber-800">
            You don&apos;t have permission to access the file manager. Ask an administrator to grant you the
            <span className="mx-1 font-semibold">documents.files.view</span>
            permission.
          </p>
        </div>
      </SettingsSectionShell>
    );
  }

  const tenantId = getTenantIdForUser(user);
  const ownerUserId = user.isSuperAdmin ? undefined : user.id;
  const [files, stats, canUpload, canDelete] = await Promise.all([
    listDocuments({ tenantId, ownerUserId }),
    getDocumentStats(tenantId, ownerUserId),
    hasPermissionForUser(user, "documents.files.upload"),
    hasPermissionForUser(user, "documents.files.delete"),
  ]);

  return (
    <SettingsSectionShell
      title="Documents"
      description="Access the shared file manager and linked documents from settings."
    >
      <div className="space-y-6 rounded-lg border border-border/70 bg-background p-6 shadow-sm lg:p-8">
        <FilePickerDemo />
        <FileManager
          initialFiles={files.map(serializeFile)}
          initialStats={stats}
          canUpload={canUpload}
          canDelete={canDelete}
        />
      </div>
    </SettingsSectionShell>
  );
}