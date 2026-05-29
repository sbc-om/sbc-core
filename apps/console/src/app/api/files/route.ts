import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getTenantIdForUser, requirePermissionForUser } from "@/lib/authorization";
import {
  getDocumentStats,
  listDocuments,
  uploadDocuments,
} from "@sbc/module-documents/services";

function getString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getTags(input: string | undefined): string[] {
  if (!input) return [];
  return input
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requirePermissionForUser(user, "documents.files.view");

    const tenantId = getTenantIdForUser(user);
    const ownerUserId = user.isSuperAdmin ? undefined : user.id;
    const query = request.nextUrl.searchParams.get("query") ?? undefined;
    const folder = request.nextUrl.searchParams.get("folder") ?? undefined;

    const [files, stats] = await Promise.all([
      listDocuments({ tenantId, ownerUserId, query, folder }),
      getDocumentStats(tenantId, ownerUserId),
    ]);

    return NextResponse.json({ files, stats });
  } catch (error) {
    console.error("[files:list]", error);
    const status = error instanceof Error && error.name === "PermissionDeniedError" ? 403 : 500;
    return NextResponse.json({ error: status === 403 ? "Forbidden" : "Unable to load files" }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requirePermissionForUser(user, "documents.files.upload");

    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (files.length === 0) {
      return NextResponse.json({ error: "At least one file is required" }, { status: 400 });
    }

    const title = files.length === 1 ? getString(formData, "title") : undefined;
    const folder = getString(formData, "folder");
    const moduleName = getString(formData, "moduleName");
    const tags = getTags(getString(formData, "tags"));
    const tenantId = getTenantIdForUser(user);

    const created = await uploadDocuments(
      files.map((file) => ({
        tenantId,
        userId: user.id,
        file,
        title,
        folder,
        moduleName,
        tags,
      }))
    );

    return NextResponse.json({ files: created }, { status: 201 });
  } catch (error) {
    console.error("[files:upload]", error);
    const status = error instanceof Error && error.name === "PermissionDeniedError" ? 403 : 500;
    return NextResponse.json({ error: status === 403 ? "Forbidden" : "Unable to upload files" }, { status });
  }
}