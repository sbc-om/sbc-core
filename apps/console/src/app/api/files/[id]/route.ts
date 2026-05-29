import { NextRequest, NextResponse } from "next/server";
import {
  deleteDocument,
  getDocumentVisibility,
  readDocumentContent,
} from "@sbc/module-documents/services";
import { getSessionUser } from "@/lib/session";
import { getTenantIdForUser, requirePermissionForUser } from "@/lib/authorization";

function contentDisposition(filename: string, mode: "inline" | "attachment"): string {
  const encoded = encodeURIComponent(filename);
  return `${mode}; filename*=UTF-8''${encoded}`;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await getSessionUser();
    const tenantId = user ? getTenantIdForUser(user) : request.nextUrl.searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const visibility = await getDocumentVisibility(id, tenantId);

    if (visibility === "public") {
      // Public files may be served without an authenticated session.
    } else if (visibility === "tenant") {
      if (!user || getTenantIdForUser(user) !== tenantId) {
        return NextResponse.json({ error: user ? "Forbidden" : "Unauthorized" }, { status: user ? 403 : 401 });
      }
    } else {
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      await requirePermissionForUser(user, "documents.files.view");
    }

    const payload = await readDocumentContent(id, tenantId);

    if (!payload) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const mode = request.nextUrl.searchParams.get("download") === "1" ? "attachment" : "inline";

    return new NextResponse(new Uint8Array(payload.content), {
      headers: {
        "Content-Type": payload.document.mimeType,
        "Content-Length": payload.content.byteLength.toString(),
        "Content-Disposition": contentDisposition(payload.document.originalName, mode),
        "Cache-Control": visibility === "public" ? "public, max-age=300" : "private, max-age=60",
      },
    });
  } catch (error) {
    console.error("[files:get]", error);
    const status = error instanceof Error && error.name === "PermissionDeniedError" ? 403 : 500;
    return NextResponse.json({ error: status === 403 ? "Forbidden" : "Unable to load file" }, { status });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requirePermissionForUser(user, "documents.files.delete");

    const { id } = await context.params;
    const tenantId = getTenantIdForUser(user);
    const deleted = await deleteDocument(id, tenantId, user.id);

    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[files:delete]", error);
    const status = error instanceof Error && error.name === "PermissionDeniedError" ? 403 : 500;
    return NextResponse.json({ error: status === 403 ? "Forbidden" : "Unable to delete file" }, { status });
  }
}