import { sql } from "drizzle-orm";
import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { baseColumns } from "@sbc/database/base";

export const documentsFiles = pgTable("documents_files", {
  ...baseColumns,
  title:        text("title").notNull(),
  originalName: text("original_name").notNull(),
  storageKey:   text("storage_key").notNull().unique(),
  storagePath:  text("storage_path").notNull(),
  folder:       text("folder").notNull().default("general"),
  moduleName:   text("module_name"),
  mimeType:     text("mime_type").notNull(),
  extension:    text("extension"),
  sizeBytes:    integer("size_bytes").notNull(),
  tags:         text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
});

export const documentLinks = pgTable("documents_links", {
  ...baseColumns,
  documentId:      uuid("document_id").notNull(),
  resourceModule:  text("resource_module").notNull(),
  resourceType:    text("resource_type").notNull(),
  resourceId:      text("resource_id").notNull(),
  fieldName:       text("field_name").notNull(),
  linkLabel:       text("link_label").notNull().default("Attachment"),
  visibility:      text("visibility").notNull().default("internal"),
  sortOrder:       integer("sort_order").notNull().default(0),
});

export type DocumentFile = typeof documentsFiles.$inferSelect;
export type NewDocumentFile = typeof documentsFiles.$inferInsert;
export type DocumentLink = typeof documentLinks.$inferSelect;
export type NewDocumentLink = typeof documentLinks.$inferInsert;