import crypto from "node:crypto";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@sbc/database";
import { documentLinks, documentsFiles, type DocumentLink } from "../schema";
import { ensureDocumentsInfrastructure, getDocumentById } from "./files";

export type DocumentVisibility = "internal" | "tenant" | "public";

export interface ResourceLinkKey {
  tenantId: string;
  resourceModule: string;
  resourceType: string;
  resourceId: string;
  fieldName: string;
}

export interface ReplaceDocumentLinkInput extends ResourceLinkKey {
  userId: string | null;
  documentId: string | null;
  linkLabel?: string;
  visibility?: DocumentVisibility;
  sortOrder?: number;
}

export interface AddDocumentLinkInput extends ResourceLinkKey {
  userId: string | null;
  documentId: string;
  linkLabel?: string;
  visibility?: DocumentVisibility;
  sortOrder?: number;
}

export interface LinkedDocument {
  link: DocumentLink;
  document: {
    id: string;
    title: string;
    originalName: string;
    folder: string;
    moduleName: string | null;
    mimeType: string;
    extension: string | null;
    sizeBytes: number;
    tags: string[];
    createdAt: Date;
  };
}

export interface UpdateDocumentLinkInput {
  tenantId: string;
  linkId: string;
  userId: string | null;
  linkLabel?: string;
  visibility?: DocumentVisibility;
  sortOrder?: number;
}

const visibilityRank: Record<DocumentVisibility, number> = {
  internal: 0,
  tenant: 1,
  public: 2,
};

export async function getLatestDocumentLink(key: ResourceLinkKey): Promise<DocumentLink | null> {
  await ensureDocumentsInfrastructure();

  const [link] = await db
    .select()
    .from(documentLinks)
    .where(
      and(
        eq(documentLinks.tenantId, key.tenantId),
        eq(documentLinks.resourceModule, key.resourceModule),
        eq(documentLinks.resourceType, key.resourceType),
        eq(documentLinks.resourceId, key.resourceId),
        eq(documentLinks.fieldName, key.fieldName),
        eq(documentLinks.isDeleted, false)
      )
    )
    .orderBy(desc(documentLinks.createdAt))
    .limit(1);

  return link ?? null;
}

export async function replaceDocumentLink(input: ReplaceDocumentLinkInput): Promise<DocumentLink | null> {
  await ensureDocumentsInfrastructure();

  const now = new Date();

  await db
    .update(documentLinks)
    .set({
      isDeleted: true,
      deletedAt: now,
      deletedBy: input.userId,
      updatedAt: now,
      updatedBy: input.userId,
    })
    .where(
      and(
        eq(documentLinks.tenantId, input.tenantId),
        eq(documentLinks.resourceModule, input.resourceModule),
        eq(documentLinks.resourceType, input.resourceType),
        eq(documentLinks.resourceId, input.resourceId),
        eq(documentLinks.fieldName, input.fieldName),
        eq(documentLinks.isDeleted, false)
      )
    );

  if (!input.documentId) {
    return null;
  }

  const document = await getDocumentById(input.documentId, input.tenantId);
  if (!document) {
    throw new Error("Referenced document does not exist for this tenant");
  }

  const [created] = await db
    .insert(documentLinks)
    .values({
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      createdAt: now,
      updatedAt: now,
      createdBy: input.userId,
      updatedBy: input.userId,
      isDeleted: false,
      documentId: input.documentId,
      resourceModule: input.resourceModule,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      fieldName: input.fieldName,
      linkLabel: input.linkLabel?.trim() || "Attachment",
      visibility: input.visibility ?? "internal",
      sortOrder: input.sortOrder ?? 0,
    })
    .returning();

  return created ?? null;
}

export async function addDocumentLink(input: AddDocumentLinkInput): Promise<DocumentLink | null> {
  await ensureDocumentsInfrastructure();

  const document = await getDocumentById(input.documentId, input.tenantId);
  if (!document) {
    throw new Error("Referenced document does not exist for this tenant");
  }

  const [existing] = await db
    .select()
    .from(documentLinks)
    .where(
      and(
        eq(documentLinks.tenantId, input.tenantId),
        eq(documentLinks.documentId, input.documentId),
        eq(documentLinks.resourceModule, input.resourceModule),
        eq(documentLinks.resourceType, input.resourceType),
        eq(documentLinks.resourceId, input.resourceId),
        eq(documentLinks.fieldName, input.fieldName),
        eq(documentLinks.isDeleted, false)
      )
    )
    .limit(1);

  if (existing) {
    return existing;
  }

  const now = new Date();
  const [created] = await db
    .insert(documentLinks)
    .values({
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      createdAt: now,
      updatedAt: now,
      createdBy: input.userId,
      updatedBy: input.userId,
      isDeleted: false,
      documentId: input.documentId,
      resourceModule: input.resourceModule,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      fieldName: input.fieldName,
      linkLabel: input.linkLabel?.trim() || "Attachment",
      visibility: input.visibility ?? "internal",
      sortOrder: input.sortOrder ?? 0,
    })
    .returning();

  return created ?? null;
}

export async function listLinkedDocuments(key: Omit<ResourceLinkKey, "fieldName"> & { fieldName?: string }): Promise<LinkedDocument[]> {
  await ensureDocumentsInfrastructure();

  const rows = await db
    .select({
      link: documentLinks,
      document: documentsFiles,
    })
    .from(documentLinks)
    .innerJoin(documentsFiles, eq(documentLinks.documentId, documentsFiles.id))
    .where(
      and(
        eq(documentLinks.tenantId, key.tenantId),
        eq(documentLinks.resourceModule, key.resourceModule),
        eq(documentLinks.resourceType, key.resourceType),
        eq(documentLinks.resourceId, key.resourceId),
        key.fieldName ? eq(documentLinks.fieldName, key.fieldName) : undefined as never,
        eq(documentLinks.isDeleted, false),
        eq(documentsFiles.isDeleted, false)
      )
    )
    .orderBy(asc(documentLinks.sortOrder), desc(documentLinks.createdAt));

  return rows;
}

export async function getDocumentVisibility(documentId: string, tenantId: string): Promise<DocumentVisibility | null> {
  await ensureDocumentsInfrastructure();

  const rows = await db
    .select({ visibility: documentLinks.visibility })
    .from(documentLinks)
    .where(
      and(
        eq(documentLinks.documentId, documentId),
        eq(documentLinks.tenantId, tenantId),
        eq(documentLinks.isDeleted, false)
      )
    );

  if (rows.length === 0) {
    return null;
  }

  return rows.reduce<DocumentVisibility>((current, row) => {
    const next = (row.visibility as DocumentVisibility) ?? "internal";
    return visibilityRank[next] > visibilityRank[current] ? next : current;
  }, "internal");
}

export async function updateDocumentLink(input: UpdateDocumentLinkInput): Promise<DocumentLink | null> {
  await ensureDocumentsInfrastructure();

  const [updated] = await db
    .update(documentLinks)
    .set({
      ...(input.linkLabel !== undefined ? { linkLabel: input.linkLabel.trim() || "Attachment" } : {}),
      ...(input.visibility !== undefined ? { visibility: input.visibility } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      updatedAt: new Date(),
      updatedBy: input.userId,
    })
    .where(
      and(
        eq(documentLinks.id, input.linkId),
        eq(documentLinks.tenantId, input.tenantId),
        eq(documentLinks.isDeleted, false)
      )
    )
    .returning();

  return updated ?? null;
}

export async function removeDocumentLink(linkId: string, tenantId: string, userId: string | null): Promise<DocumentLink | null> {
  await ensureDocumentsInfrastructure();

  const [removed] = await db
    .update(documentLinks)
    .set({
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: userId,
      updatedAt: new Date(),
      updatedBy: userId,
    })
    .where(
      and(
        eq(documentLinks.id, linkId),
        eq(documentLinks.tenantId, tenantId),
        eq(documentLinks.isDeleted, false)
      )
    )
    .returning();

  return removed ?? null;
}