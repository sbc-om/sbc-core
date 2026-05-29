"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  HiMiniArrowTopRightOnSquare,
  HiMiniCheckCircle,
  HiMiniCloudArrowUp,
  HiMiniDocumentText,
  HiMiniFolderOpen,
  HiMiniMagnifyingGlass,
  HiMiniPhoto,
  HiMiniXMark,
} from "react-icons/hi2";
import {
  formatFileSize,
  getFilePreviewKind,
  type FileManagerItem,
} from "./types";
import { useToast } from "@/components/system-feedback";

interface Props {
  buttonLabel?:    string;
  title?:          string;
  description?:    string;
  selectedFileId?: string | null;
  accept?:         string;
  initialFolder?:  string;
  uploadDefaults?: { folder?: string; moduleName?: string; tags?: string };
  onSelect(file: FileManagerItem): void;
}

function matchesAccept(file: Pick<FileManagerItem, "mimeType" | "extension">, accept: string | undefined) {
  if (!accept?.trim()) return true;
  const tokens = accept.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
  if (!tokens.length) return true;
  const mimeType  = file.mimeType.toLowerCase();
  const extension = file.extension ? `.${file.extension.toLowerCase()}` : "";
  return tokens.some((t) => {
    if (t.endsWith("/*")) return mimeType.startsWith(t.slice(0, -1));
    if (t.startsWith(".")) return extension === t;
    return mimeType === t;
  });
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("image/")) return <HiMiniPhoto className="h-4 w-4" />;
  return <HiMiniDocumentText className="h-4 w-4" />;
}

export function FilePickerDialog({
  buttonLabel = "Choose file",
  title = "Choose from Library",
  description,
  selectedFileId,
  accept,
  initialFolder,
  uploadDefaults,
  onSelect,
}: Props) {
  const [open, setOpen]       = useState(false);
  const [files, setFiles]     = useState<FileManagerItem[]>([]);
  const [query, setQuery]     = useState("");
  const [folder, setFolder]   = useState(initialFolder?.trim() || "all");
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mobileTab, setMobileTab]   = useState<"browse" | "upload">("browse");

  const [uploadFile, setUploadFile]           = useState<File | null>(null);
  const [uploadTitle, setUploadTitle]         = useState("");
  const [uploadFolder, setUploadFolder]       = useState(uploadDefaults?.folder ?? "");
  const [uploadModuleName, setUploadModuleName] = useState(uploadDefaults?.moduleName ?? "");
  const [uploadTags, setUploadTags]           = useState(uploadDefaults?.tags ?? "");
  const [uploadPending, startUpload]          = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const deferredQuery = useDeferredValue(query);
  const toast = useToast();

  const visibleFiles = useMemo(() => files.filter((f) => matchesAccept(f, accept)), [accept, files]);
  const folders      = useMemo(() => ["all", ...Array.from(new Set(files.map((f) => f.folder))).sort()], [files]);

  useEffect(() => { setFolder(initialFolder?.trim() || "all"); }, [initialFolder]);
  useEffect(() => {
    setUploadFolder(uploadDefaults?.folder ?? "");
    setUploadModuleName(uploadDefaults?.moduleName ?? "");
    setUploadTags(uploadDefaults?.tags ?? "");
  }, [uploadDefaults?.folder, uploadDefaults?.moduleName, uploadDefaults?.tags]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (deferredQuery.trim()) params.set("query", deferredQuery.trim());
        if (folder !== "all") params.set("folder", folder);
        const res  = await fetch(`/api/files?${params.toString()}`, { cache: "no-store" });
        const data = await res.json() as { error?: string; files?: FileManagerItem[] };
        if (!res.ok) throw new Error(data.error ?? "Unable to load files");
        if (!cancelled) setFiles(data.files ?? []);
      } catch (err) {
        if (!cancelled) toast.error("Load failed", err instanceof Error ? err.message : "Unable to load files");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [open, deferredQuery, folder, refreshKey]);

  function resetUpload() {
    setUploadFile(null); setUploadTitle("");
    setUploadFolder(uploadDefaults?.folder ?? "");
    setUploadModuleName(uploadDefaults?.moduleName ?? "");
    setUploadTags(uploadDefaults?.tags ?? "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleUpload() {
    if (!uploadFile) { toast.info("No file selected", "Choose a file first."); return; }
    startUpload(async () => {
      try {
        const form = new FormData();
        form.append("files", uploadFile);
        if (uploadTitle.trim()) form.append("title", uploadTitle.trim());
        if (uploadFolder.trim()) form.append("folder", uploadFolder.trim());
        if (uploadModuleName.trim()) form.append("moduleName", uploadModuleName.trim());
        if (uploadTags.trim()) form.append("tags", uploadTags.trim());

        const res  = await fetch("/api/files", { method: "POST", body: form });
        const data = await res.json() as { error?: string; files?: FileManagerItem[] };
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        const created = data.files?.[0];
        if (!created) throw new Error("No file returned from upload.");
        setRefreshKey((k) => k + 1);
        resetUpload();
        onSelect(created);
        setOpen(false);
        toast.success("Uploaded", "File ready and selected.");
      } catch (err) {
        toast.error("Upload failed", err instanceof Error ? err.message : "Unable to upload file");
      }
    });
  }

  /* ── shared upload form panel (used on both mobile & desktop) ── */
  const UploadPanel = (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">File</label>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
          className="block w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground file:mr-2 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs file:font-medium file:text-foreground"
        />
        {uploadFile && (
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {uploadFile.name} · {formatFileSize(uploadFile.size)}
          </p>
        )}
      </div>
      {[
        { label: "Title",  value: uploadTitle,      setter: setUploadTitle,      placeholder: "Display title" },
        { label: "Folder", value: uploadFolder,     setter: setUploadFolder,     placeholder: "general" },
        { label: "Module", value: uploadModuleName, setter: setUploadModuleName, placeholder: "crm" },
        { label: "Tags",   value: uploadTags,       setter: setUploadTags,       placeholder: "avatar, profile" },
      ].map(({ label, value, setter, placeholder }) => (
        <div key={label}>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
          <input
            value={value}
            onChange={(e) => setter(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={resetUpload}
          className="flex-1 rounded-md border border-input px-2.5 py-1.5 text-xs font-medium transition hover:bg-muted"
        >
          Reset
        </button>
        <button
          type="button"
          disabled={uploadPending || !uploadFile}
          onClick={handleUpload}
          className="flex flex-1 items-center justify-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
        >
          <HiMiniCloudArrowUp className="h-3.5 w-3.5" />
          {uploadPending ? "Uploading…" : "Upload & Select"}
        </button>
      </div>
    </div>
  );

  /* ── shared file list panel ── */
  const BrowsePanel = (
    <>
      {/* Search + folder filter */}
      <div className="flex shrink-0 gap-2 border-b border-border px-4 py-3">
        <div className="relative flex-1">
          <HiMiniMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files…"
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <select
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
        >
          {folders.map((f) => (
            <option key={f} value={f}>{f === "all" ? "All folders" : f}</option>
          ))}
        </select>
      </div>

      {/* File grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Loading…</div>
        ) : visibleFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <HiMiniFolderOpen className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">No files found</p>
            <p className="text-xs text-muted-foreground">Switch to Upload tab to add a new file.</p>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {visibleFiles.map((file) => {
              const previewKind = getFilePreviewKind(file.mimeType);
              const isSelected  = file.id === selectedFileId;
              return (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => { onSelect(file); setOpen(false); }}
                  className={`flex items-start gap-3 rounded-lg border p-3 text-left transition hover:border-primary/50 hover:bg-muted/30 ${
                    isSelected ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                    {previewKind === "image" ? (
                      <img src={`/api/files/${file.id}`} alt={file.title} className="h-full w-full object-cover" />
                    ) : (
                      <FileIcon mimeType={file.mimeType} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-medium text-foreground">{file.title}</p>
                      {isSelected && <HiMiniCheckCircle className="h-4 w-4 shrink-0 text-primary" />}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {file.folder} · {formatFileSize(file.sizeBytes)}
                    </p>
                  </div>
                  <a
                    href={`/api/files/${file.id}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    <HiMiniArrowTopRightOnSquare className="h-3.5 w-3.5" />
                  </a>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted"
      >
        <HiMiniFolderOpen className="h-3.5 w-3.5" />
        {buttonLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Close"
          />

          <div className="relative z-10 flex w-full max-h-[92vh] flex-col overflow-hidden rounded-t-lg border border-border bg-background shadow-xl sm:max-w-4xl sm:rounded-lg">

            {/* Header */}
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-6 py-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">{title}</h2>
                {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <HiMiniXMark className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile tabs — visible only on small screens */}
            <div className="flex shrink-0 border-b border-border sm:hidden">
              {(["browse", "upload"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setMobileTab(tab)}
                  className={`flex-1 py-2.5 text-sm font-medium capitalize transition-colors ${
                    mobileTab === tab
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "browse" ? "Browse" : "Upload"}
                </button>
              ))}
            </div>

            {/* Body */}
            {/* Mobile: single panel based on active tab */}
            <div className="flex flex-1 overflow-hidden sm:hidden">
              {mobileTab === "browse" ? (
                <div className="flex flex-1 flex-col overflow-hidden">
                  {BrowsePanel}
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Upload New File
                  </h3>
                  {UploadPanel}
                </div>
              )}
            </div>

            {/* Desktop: two-column layout */}
            <div className="hidden flex-1 overflow-hidden sm:flex">
              <div className="flex flex-1 flex-col overflow-hidden">
                {BrowsePanel}
              </div>
              <div className="w-64 shrink-0 overflow-y-auto border-l border-border bg-muted/20 p-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Upload New
                </h3>
                {UploadPanel}
              </div>
            </div>

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-3">
              <p className="text-xs text-muted-foreground">{visibleFiles.length} file(s) available</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-input px-4 py-2 text-sm font-medium transition hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
