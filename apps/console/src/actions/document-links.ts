"use server";

import { revalidatePath } from "next/cache";
import {
  addDocumentLink,
  removeDocumentLink,
  updateDocumentLink,
  type DocumentVisibility,
} from "@sbc/module-documents/services";
import { getSessionUser } from "@/lib/session";

function normalizeVisibility(value: string): DocumentVisibility {
  if (value === "public" || value === "tenant") {
    return value;
  }

  return "internal";
}

export async function updateDocumentLinkAction(args: {
  linkId: string;
  tenantId: string;
  resourcePath: string;
  linkLabel: string;
  visibility: string;
  sortOrder: number;
}) {
  const actor = await getSessionUser();

  await updateDocumentLink({
    linkId: args.linkId,
    tenantId: args.tenantId,
    userId: actor?.id ?? null,
    linkLabel: args.linkLabel,
    visibility: normalizeVisibility(args.visibility),
    sortOrder: args.sortOrder,
  });

  revalidatePath(args.resourcePath);
}

export async function removeDocumentLinkAction(args: {
  linkId: string;
  tenantId: string;
  resourcePath: string;
}) {
  const actor = await getSessionUser();

  await removeDocumentLink(args.linkId, args.tenantId, actor?.id ?? null);
  revalidatePath(args.resourcePath);
}

export async function addDocumentLinkAction(args: {
  tenantId: string;
  resourceModule: string;
  resourceType: string;
  resourceId: string;
  fieldName: string;
  documentId: string;
  resourcePath: string;
  linkLabel: string;
  visibility: string;
  sortOrder: number;
}) {
  const actor = await getSessionUser();

  await addDocumentLink({
    tenantId: args.tenantId,
    userId: actor?.id ?? null,
    documentId: args.documentId,
    resourceModule: args.resourceModule,
    resourceType: args.resourceType,
    resourceId: args.resourceId,
    fieldName: args.fieldName,
    linkLabel: args.linkLabel,
    visibility: normalizeVisibility(args.visibility),
    sortOrder: args.sortOrder,
  });

  revalidatePath(args.resourcePath);
}