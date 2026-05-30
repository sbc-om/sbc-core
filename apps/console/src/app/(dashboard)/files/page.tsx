import { redirect } from "next/navigation";
import { FileManager } from "@/components/documents/file-manager";
import { FilePickerDemo } from "@/components/documents/file-picker-demo";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { getSessionUser } from "@/lib/session";
import {
  getTenantIdForUser,
  hasPermissionForUser,
  requirePermissionForUser,
} from "@/lib/authorization";
import { getDocumentStats, listDocuments } from "@sbc/module-documents/services";
import type { FileManagerItem } from "@/components/documents/types";

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

export default async function FilesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  try {
    await requirePermissionForUser(user, "documents.files.view");
  } catch {
    return (
      <div className="app-surface p-6">
        <h1 className="text-lg font-semibold text-foreground">Access Denied</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          You don&apos;t have permission to access the file manager. Ask an administrator to grant you the
          <span className="mx-1 font-semibold text-foreground">documents.files.view</span>
          permission.
        </p>
      </div>
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
    <div className="space-y-6">
      <DashboardPageHeader title="Files" />
      <FilePickerDemo />
      <FileManager
        initialFiles={files.map(serializeFile)}
        initialStats={stats}
        canUpload={canUpload}
        canDelete={canDelete}
      />
    </div>
  );
}