import { notFound, redirect } from "next/navigation";
import { getUserWithRoles } from "@sbc/module-iam/services";
import { getDocumentById, getLatestDocumentLink } from "@sbc/module-documents/services";
import type { FileManagerItem } from "@/components/documents/types";
import { getSessionUser } from "@/lib/session";

export async function getCurrentSettingsUser() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/login?from=%2Fsettings");

  const user = await getUserWithRoles(sessionUser.id);
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

  return {
    user,
    tenantId,
    initialAvatar,
  };
}
