import { redirect } from "next/navigation";
import { FileManager } from "@/components/documents/file-manager";
import { FilePickerDemo } from "@/components/documents/file-picker-demo";
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
      <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-8">
        <h1 className="text-2xl font-bold text-amber-950">Access denied</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-amber-800">
          You do not currently have permission to open the system file manager. Request the
          <span className="mx-1 font-semibold">documents.files.view</span>
          permission from an administrator.
        </p>
      </div>
    );
  }

  const tenantId = getTenantIdForUser(user);
  const [files, stats, canUpload, canDelete] = await Promise.all([
    listDocuments({ tenantId }),
    getDocumentStats(tenantId),
    hasPermissionForUser(user, "documents.files.upload"),
    hasPermissionForUser(user, "documents.files.delete"),
  ]);

  return (
    <div className="space-y-6">
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