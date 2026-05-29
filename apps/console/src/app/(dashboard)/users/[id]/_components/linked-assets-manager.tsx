"use client";

import { useState, useTransition } from "react";
import { HiMiniArrowTopRightOnSquare, HiMiniTrash } from "react-icons/hi2";
import {
  addDocumentLinkAction,
  removeDocumentLinkAction,
  updateDocumentLinkAction,
} from "@/actions/document-links";
import { FilePickerDialog } from "@/components/documents/file-picker-dialog";
import { useConfirm, useToast } from "@/components/system-feedback";
import { formatFileSize, type FileManagerItem } from "@/components/documents/types";
import { buildDocumentUrl } from "@/lib/documents";

type Visibility = "internal" | "tenant" | "public";

export interface LinkedAssetItem {
  link: {
    id: string;
    fieldName: string;
    linkLabel: string;
    visibility: Visibility;
    sortOrder: number;
  };
  document: {
    id: string;
    title: string;
    originalName: string;
    folder: string;
    sizeBytes: number;
  };
}

interface Props {
  items: LinkedAssetItem[];
  tenantId: string;
  resourcePath: string;
  resourceModule: string;
  resourceType: string;
  resourceId: string;
}

function LinkedAssetCard({
  item,
  tenantId,
  resourcePath,
  resourceModule,
  resourceType,
  resourceId,
}: {
  item: LinkedAssetItem;
  tenantId: string;
  resourcePath: string;
  resourceModule: string;
  resourceType: string;
  resourceId: string;
}) {
  const [linkLabel, setLinkLabel] = useState(item.link.linkLabel);
  const [visibility, setVisibility] = useState<Visibility>(item.link.visibility);
  const [sortOrder, setSortOrder] = useState(String(item.link.sortOrder));
  const [pending, startTransition] = useTransition();
  const confirm = useConfirm();
  const toast = useToast();

  function save() {
    startTransition(async () => {
      try {
        await updateDocumentLinkAction({
          linkId: item.link.id,
          tenantId,
          resourcePath,
          linkLabel,
          visibility,
          sortOrder: Number(sortOrder) || 0,
        });
        toast.success("Asset updated", "Linked asset metadata was saved.");
      } catch (error) {
        toast.error("Save failed", error instanceof Error ? error.message : "Unable to save asset metadata.");
      }
    });
  }

  async function remove() {
    const accepted = await confirm({
      title: "Unlink asset?",
      description: "This will remove the relation from the record. The original file will stay محفوظ in the system library.",
      confirmLabel: "Unlink asset",
      tone: "danger",
    });
    if (!accepted) return;

    startTransition(async () => {
      try {
        await removeDocumentLinkAction({
          linkId: item.link.id,
          tenantId,
          resourcePath,
        });
        toast.success("Asset unlinked", "The file relation was removed from this record.");
      } catch (error) {
        toast.error("Unlink failed", error instanceof Error ? error.message : "Unable to unlink asset.");
      }
    });
  }

  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{item.document.title}</p>
          <p className="truncate text-sm text-muted-foreground">{item.document.originalName}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-border bg-muted px-2.5 py-1">{item.link.fieldName}</span>
            <span className="rounded-full border border-border bg-muted px-2.5 py-1">{item.document.folder}</span>
            <span className="rounded-full border border-border bg-muted px-2.5 py-1">{formatFileSize(item.document.sizeBytes)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={buildDocumentUrl(item.document.id, {
              tenantId,
              resourceModule,
              resourceType,
              resourceId,
              fieldName: item.link.fieldName,
            })}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            <HiMiniArrowTopRightOnSquare className="h-4 w-4" />
            Open
          </a>
          <button
            type="button"
            disabled={pending}
            onClick={remove}
            className="inline-flex items-center gap-2 rounded-md border border-rose-300/40 px-3 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-500/10 dark:text-rose-400 disabled:opacity-50"
          >
            <HiMiniTrash className="h-4 w-4" />
            Unlink
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="space-y-1 text-sm">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Label</span>
          <input
            value={linkLabel}
            onChange={(event) => setLinkLabel(event.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Visibility</span>
          <select
            value={visibility}
            onChange={(event) => setVisibility(event.target.value as Visibility)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="internal">Internal</option>
            <option value="tenant">Tenant</option>
            <option value="public">Public</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Sort order</span>
          <input
            type="number"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          disabled={pending}
          onClick={save}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save metadata"}
        </button>
      </div>
    </div>
  );
}

function AddLinkedAssetCard({
  tenantId,
  resourcePath,
  resourceModule,
  resourceType,
  resourceId,
}: Omit<Props, "items">) {
  const [selectedFile, setSelectedFile] = useState<FileManagerItem | null>(null);
  const [fieldName, setFieldName] = useState("attachment");
  const [linkLabel, setLinkLabel] = useState("Supporting document");
  const [visibility, setVisibility] = useState<Visibility>("internal");
  const [sortOrder, setSortOrder] = useState("10");
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  function add() {
    if (!selectedFile) {
      toast.info("No file selected", "Choose a file from the library before linking it.");
      return;
    }

    startTransition(async () => {
      try {
        await addDocumentLinkAction({
          tenantId,
          resourceModule,
          resourceType,
          resourceId,
          fieldName: fieldName.trim() || "attachment",
          documentId: selectedFile.id,
          resourcePath,
          linkLabel,
          visibility,
          sortOrder: Number(sortOrder) || 0,
        });

        setSelectedFile(null);
        setFieldName("attachment");
        setLinkLabel("Supporting document");
        setVisibility("internal");
        setSortOrder("10");
        toast.success("Asset linked", "The document is now attached to this record.");
      } catch (error) {
        toast.error("Link failed", error instanceof Error ? error.message : "Unable to link the selected asset.");
      }
    });
  }

  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Add linked asset</p>
          <p className="mt-1 text-sm text-muted-foreground">Select an existing file from the central library or upload one here and link it to this record.</p>
        </div>
        <FilePickerDialog
          buttonLabel={selectedFile ? "Replace file" : "Choose file"}
          title="Choose asset to link"
          description="Select an existing file from the global file manager and attach it to this record with structured metadata."
          uploadDefaults={{
            folder: "users/assets",
            moduleName: "iam",
            tags: "attachment,user-record",
          }}
          selectedFileId={selectedFile?.id ?? null}
          onSelect={setSelectedFile}
        />
      </div>

      {selectedFile && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{selectedFile.title}</p>
            <p className="truncate text-xs text-muted-foreground">{selectedFile.originalName}</p>
          </div>
          <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">{formatFileSize(selectedFile.sizeBytes)}</span>
        </div>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <label className="space-y-1 text-sm">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Field</span>
          <input
            value={fieldName}
            onChange={(event) => setFieldName(event.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Label</span>
          <input
            value={linkLabel}
            onChange={(event) => setLinkLabel(event.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Visibility</span>
          <select
            value={visibility}
            onChange={(event) => setVisibility(event.target.value as Visibility)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="internal">Internal</option>
            <option value="tenant">Tenant</option>
            <option value="public">Public</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Sort order</span>
          <input
            type="number"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          disabled={pending || !selectedFile}
          onClick={add}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? "Linking..." : "Link asset"}
        </button>
      </div>
    </div>
  );
}

export function LinkedAssetsManager({ items, tenantId, resourcePath, resourceModule, resourceType, resourceId }: Props) {
  return (
    <div className="space-y-3">
      <AddLinkedAssetCard
        tenantId={tenantId}
        resourcePath={resourcePath}
        resourceModule={resourceModule}
        resourceType={resourceType}
        resourceId={resourceId}
      />
      {items.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
          No linked assets yet.
        </div>
      )}
      {items.map((item) => (
        <LinkedAssetCard
          key={item.link.id}
          item={item}
          tenantId={tenantId}
          resourcePath={resourcePath}
          resourceModule={resourceModule}
          resourceType={resourceType}
          resourceId={resourceId}
        />
      ))}
    </div>
  );
}
