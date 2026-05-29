import path from "node:path";
import crypto from "node:crypto";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@sbc/database";
import { documentLinks, documentsFiles, type DocumentFile } from "../schema";
import { ensureStorageReady, readObject, removeObject, storeObject } from "./storage";

export interface UploadableFile {
  name: string;
  type: string;
  size: number;
  arrayBuffer(): Promise<ArrayBuffer>;
}

export interface DocumentFilters {
  tenantId: string;
  query?: string;
  folder?: string;
  limit?: number;
}

export interface UploadDocumentInput {
  tenantId: string;
  userId: string;
  file: UploadableFile;
  folder?: string;
  moduleName?: string;
  title?: string;
  tags?: string[];
}

export interface DocumentStats {
  totalFiles: number;
  totalSizeBytes: number;
  recentUploads: number;
  folderCount: number;
}

const DEFAULT_FOLDER = "general";
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function sanitizeSegment(input: string | undefined, fallback: string): string {
  const sanitized = (input ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");

  return sanitized || fallback;
}

function parseTags(tags: string[] | undefined): string[] {
  return (tags ?? [])
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .filter((tag, index, all) => all.indexOf(tag) === index);
}

function inferMimeType(fileName: string): string {
  const extension = path.extname(fileName).toLowerCase();

  switch (extension) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".pdf":
      return "application/pdf";
    case ".doc":
      return "application/msword";
    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case ".xls":
      return "application/vnd.ms-excel";
    case ".xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case ".ppt":
      return "application/vnd.ms-powerpoint";
    case ".pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case ".zip":
      return "application/zip";
    case ".txt":
      return "text/plain";
    case ".csv":
      return "text/csv";
    default:
      return "application/octet-stream";
  }
}

function buildStorageKey(tenantId: string, folder: string, originalName: string): string {
  const extension = path.extname(originalName).toLowerCase();
  const dayKey = new Date().toISOString().slice(0, 10);
  return path.posix.join(
    sanitizeSegment(tenantId, "tenant"),
    folder,
    dayKey,
    `${crypto.randomUUID()}${extension}`
  );
}

export async function ensureDocumentsInfrastructure(): Promise<void> {
  await ensureStorageReady();

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS documents_files (
      id uuid PRIMARY KEY,
      tenant_id uuid NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      created_by uuid,
      updated_by uuid,
      is_deleted boolean NOT NULL DEFAULT false,
      deleted_at timestamptz,
      deleted_by uuid,
      title text NOT NULL,
      original_name text NOT NULL,
      storage_key text NOT NULL,
      storage_path text NOT NULL,
      folder text NOT NULL DEFAULT 'general',
      module_name text,
      mime_type text NOT NULL,
      extension text,
      size_bytes integer NOT NULL,
      tags text[] NOT NULL DEFAULT ARRAY[]::text[]
    )
  `);

  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS documents_files_storage_key_idx ON documents_files (storage_key)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS documents_files_tenant_created_idx ON documents_files (tenant_id, created_at DESC)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS documents_files_tenant_folder_idx ON documents_files (tenant_id, folder)`);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS documents_links (
      id uuid PRIMARY KEY,
      tenant_id uuid NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      created_by uuid,
      updated_by uuid,
      is_deleted boolean NOT NULL DEFAULT false,
      deleted_at timestamptz,
      deleted_by uuid,
      document_id uuid NOT NULL,
      resource_module text NOT NULL,
      resource_type text NOT NULL,
      resource_id text NOT NULL,
      field_name text NOT NULL,
      link_label text NOT NULL DEFAULT 'Attachment',
      visibility text NOT NULL DEFAULT 'internal',
      sort_order integer NOT NULL DEFAULT 0
    )
  `);
  await db.execute(sql`ALTER TABLE documents_links ADD COLUMN IF NOT EXISTS link_label text NOT NULL DEFAULT 'Attachment'`);
  await db.execute(sql`ALTER TABLE documents_links ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'internal'`);
  await db.execute(sql`ALTER TABLE documents_links ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS documents_links_resource_idx ON documents_links (tenant_id, resource_module, resource_type, resource_id, field_name)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS documents_links_document_idx ON documents_links (document_id)`);
}

export async function listDocuments(filters: DocumentFilters): Promise<DocumentFile[]> {
  await ensureDocumentsInfrastructure();

  const clauses = [
    eq(documentsFiles.tenantId, filters.tenantId),
    eq(documentsFiles.isDeleted, false),
  ];

  if (filters.query?.trim()) {
    const search = `%${filters.query.trim()}%`;
    clauses.push(
      or(
        ilike(documentsFiles.originalName, search),
        ilike(documentsFiles.title, search),
        ilike(documentsFiles.folder, search),
        ilike(documentsFiles.moduleName, search)
      )!
    );
  }

  if (filters.folder?.trim() && filters.folder !== "all") {
    clauses.push(eq(documentsFiles.folder, sanitizeSegment(filters.folder, DEFAULT_FOLDER)));
  }

  return db
    .select()
    .from(documentsFiles)
    .where(and(...clauses))
    .orderBy(desc(documentsFiles.createdAt))
    .limit(filters.limit ?? 200);
}

export async function getDocumentStats(tenantId: string): Promise<DocumentStats> {
  const files = await listDocuments({ tenantId, limit: 500 });
  const recentThreshold = Date.now() - ONE_WEEK_MS;

  return {
    totalFiles: files.length,
    totalSizeBytes: files.reduce((sum, file) => sum + file.sizeBytes, 0),
    recentUploads: files.filter((file) => file.createdAt.getTime() >= recentThreshold).length,
    folderCount: new Set(files.map((file) => file.folder)).size,
  };
}

export async function uploadDocument(input: UploadDocumentInput): Promise<DocumentFile> {
  await ensureDocumentsInfrastructure();

  const originalName = path.basename(input.file.name || "file");
  const folder = sanitizeSegment(input.folder, DEFAULT_FOLDER);
  const storageKey = buildStorageKey(input.tenantId, folder, originalName);
  const bytes = Buffer.from(await input.file.arrayBuffer());
  const now = new Date();
  const mimeType = input.file.type || inferMimeType(originalName);
  const storedObject = await storeObject(storageKey, bytes, mimeType);

  const [created] = await db
    .insert(documentsFiles)
    .values({
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      createdAt: now,
      updatedAt: now,
      createdBy: input.userId,
      updatedBy: input.userId,
      isDeleted: false,
      title: input.title?.trim() || originalName.replace(/\.[^.]+$/, ""),
      originalName,
      storageKey,
      storagePath: storedObject.storagePath,
      folder,
      moduleName: input.moduleName ? sanitizeSegment(input.moduleName, "system") : null,
      mimeType,
      extension: path.extname(originalName).toLowerCase() || null,
      sizeBytes: bytes.byteLength,
      tags: parseTags(input.tags),
    })
    .returning();

  if (!created) {
    throw new Error("Document row was not created");
  }

  return created;
}

export async function uploadDocuments(inputs: UploadDocumentInput[]): Promise<DocumentFile[]> {
  const created: DocumentFile[] = [];
  for (const input of inputs) {
    created.push(await uploadDocument(input));
  }
  return created;
}

export async function getDocumentById(id: string, tenantId: string): Promise<DocumentFile | null> {
  await ensureDocumentsInfrastructure();

  const [document] = await db
    .select()
    .from(documentsFiles)
    .where(
      and(
        eq(documentsFiles.id, id),
        eq(documentsFiles.tenantId, tenantId),
        eq(documentsFiles.isDeleted, false)
      )
    )
    .limit(1);

  return document ?? null;
}

export async function readDocumentContent(id: string, tenantId: string): Promise<{ document: DocumentFile; content: Buffer } | null> {
  const document = await getDocumentById(id, tenantId);
  if (!document) return null;

  const content = await readObject(document.storageKey);
  return { document, content };
}

export async function deleteDocument(id: string, tenantId: string, userId: string): Promise<DocumentFile | null> {
  const existing = await getDocumentById(id, tenantId);
  if (!existing) return null;

  try {
    await removeObject(existing.storageKey);
  } catch {
    // File may already be missing; metadata still needs to be retired.
  }

  const [deleted] = await db
    .update(documentsFiles)
    .set({
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: userId,
      updatedAt: new Date(),
      updatedBy: userId,
    })
    .where(and(eq(documentsFiles.id, id), eq(documentsFiles.tenantId, tenantId)))
    .returning();

  return deleted ?? null;
}