"use client";

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type ChangeEvent,
} from "react";
import {
  HiMiniArrowDownTray,
  HiMiniCloudArrowUp,
  HiMiniDocumentText,
  HiMiniEye,
  HiMiniFolderOpen,
  HiMiniMagnifyingGlass,
  HiMiniPhoto,
  HiMiniXMark,
  HiMiniTrash,
} from "react-icons/hi2";
import {
  formatFileSize,
  getFilePreviewKind,
  type FileManagerItem,
  type FileManagerStats,
} from "./types";
import { useConfirm, useToast } from "@/components/system-feedback";

interface Props {
  initialFiles: FileManagerItem[];
  initialStats: FileManagerStats;
  canUpload:    boolean;
  canDelete:    boolean;
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("image/")) return <HiMiniPhoto className="h-4 w-4" />;
  return <HiMiniDocumentText className="h-4 w-4" />;
}

export function FileManager({ initialFiles, initialStats, canUpload, canDelete }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles]               = useState(initialFiles);
  const [stats, setStats]               = useState(initialStats);
  const [query, setQuery]               = useState("");
  const [activeFolder, setActiveFolder] = useState("all");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [title, setTitle]               = useState("");
  const [folderInput, setFolderInput]   = useState("general");
  const [moduleName, setModuleName]     = useState("");
  const [tags, setTags]                 = useState("");
  const [loading, setLoading]           = useState(false);
  const [uploading, setUploading]       = useState(false);
  const [dragging, setDragging]         = useState(false);
  const [previewFile, setPreviewFile]   = useState<FileManagerItem | null>(null);
  const deferredQuery = useDeferredValue(query);
  const confirm = useConfirm();
  const toast   = useToast();

  const folders = useMemo(() => {
    return ["all", ...Array.from(new Set(files.map((f) => f.folder))).sort()];
  }, [files]);

  async function refresh(nextQuery = deferredQuery, nextFolder = activeFolder) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (nextQuery.trim()) params.set("query", nextQuery.trim());
      if (nextFolder !== "all") params.set("folder", nextFolder);

      const res  = await fetch(`/api/files?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unable to load files");
      startTransition(() => { setFiles(data.files); setStats(data.stats); });
    } catch (err) {
      toast.error("Failed to refresh", err instanceof Error ? err.message : "Unable to load files");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(deferredQuery, activeFolder); }, [deferredQuery, activeFolder]);

  function selectFiles(next: File[]) {
    setSelectedFiles(next);
    if (next.length === 1 && !title.trim()) setTitle(next[0]?.name.replace(/\.[^.]+$/, "") ?? "");
    if (next.length > 1) setTitle("");
  }

  function onFileInput(e: ChangeEvent<HTMLInputElement>) { selectFiles(Array.from(e.target.files ?? [])); }
  function onDrop(e: DragEvent<HTMLButtonElement>) {
    e.preventDefault(); setDragging(false);
    selectFiles(Array.from(e.dataTransfer.files ?? []));
  }

  async function upload() {
    if (!selectedFiles.length) { toast.info("No files selected", "Choose at least one file."); return; }
    setUploading(true);
    try {
      const body = new FormData();
      selectedFiles.forEach((f) => body.append("files", f));
      if (title.trim() && selectedFiles.length === 1) body.set("title", title.trim());
      if (folderInput.trim()) body.set("folder", folderInput.trim());
      if (moduleName.trim()) body.set("moduleName", moduleName.trim());
      if (tags.trim()) body.set("tags", tags.trim());

      const res  = await fetch("/api/files", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      setSelectedFiles([]); setTitle("");
      if (inputRef.current) inputRef.current.value = "";
      await refresh(query, activeFolder);
      toast.success("Uploaded", "Files added to the library.");
    } catch (err) {
      toast.error("Upload failed", err instanceof Error ? err.message : "Unable to upload files");
    } finally {
      setUploading(false);
    }
  }

  async function remove(id: string) {
    const ok = await confirm({
      title: "Delete file?",
      description: "This removes the file from storage permanently.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      const res  = await fetch(`/api/files/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unable to delete file");
      await refresh(query, activeFolder);
      toast.success("Deleted", "File removed from the library.");
    } catch (err) {
      toast.error("Delete failed", err instanceof Error ? err.message : "Unable to delete file");
    }
  }

  const previewKind = previewFile ? getFilePreviewKind(previewFile.mimeType) : null;

  return (
    <>
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Files",    value: String(stats.totalFiles) },
          { label: "Storage",  value: formatFileSize(stats.totalSizeBytes) },
          { label: "Recent",   value: String(stats.recentUploads) },
          { label: "Folders",  value: String(stats.folderCount) },
        ].map((s) => (
          <div key={s.label} className="app-surface p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className="mt-1.5 text-xl font-semibold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        {/* Upload panel */}
        <div className="app-surface p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-foreground">Upload Files</h2>
            <span className={`app-badge ${canUpload ? "app-badge-subtle" : "app-badge-muted"}`}>
              {canUpload ? "Enabled" : "Read only"}
            </span>
          </div>

          <button
            type="button"
            disabled={!canUpload}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); if (canUpload) setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`flex min-h-36 w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-8 text-center transition ${
              dragging
                ? "border-primary bg-primary/5"
                : "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40"
            } ${!canUpload ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
              <HiMiniCloudArrowUp className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">Drop files or click to browse</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Any file type accepted</p>
            </div>
          </button>

          <input ref={inputRef} type="file" multiple className="hidden" onChange={onFileInput} />

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { label: "Title",   value: title,       setter: setTitle,       placeholder: "Display title", disabled: selectedFiles.length > 1 },
              { label: "Folder",  value: folderInput, setter: setFolderInput, placeholder: "general" },
              { label: "Module",  value: moduleName,  setter: setModuleName,  placeholder: "crm" },
              { label: "Tags",    value: tags,        setter: setTags,        placeholder: "contract, signed" },
            ].map(({ label, value, setter, placeholder, disabled }) => (
              <div key={label}>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
                <input
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  disabled={!canUpload || disabled}
                  placeholder={placeholder}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
                />
              </div>
            ))}
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-4 rounded-md border border-border bg-muted/20 p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">{selectedFiles.length} file(s) selected</p>
              <div className="space-y-1.5">
                {selectedFiles.map((f) => (
                  <div key={`${f.name}-${f.size}`} className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <FileIcon mimeType={f.type || "application/octet-stream"} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(f.size)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            disabled={!canUpload || uploading || selectedFiles.length === 0}
            onClick={() => void upload()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <HiMiniCloudArrowUp className="h-4 w-4" />
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>

        {/* File list */}
          <div className="app-surface p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold text-foreground">File Library</h2>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:flex-none">
                <HiMiniMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search files…"
                  className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 sm:w-52"
                />
              </div>
              <select
                value={activeFolder}
                onChange={(e) => setActiveFolder(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
              >
                {folders.map((f) => (
                  <option key={f} value={f}>{f === "all" ? "All folders" : f}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="rounded-lg border border-border bg-muted/20 py-12 text-center text-sm text-muted-foreground">
                Loading…
              </div>
            ) : files.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
                <HiMiniFolderOpen className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm font-medium text-foreground">No files found</p>
                <p className="text-xs text-muted-foreground">Upload a file or adjust your filters.</p>
              </div>
            ) : (
              files.map((file) => (
                <div key={file.id} className="app-surface app-surface-interactive p-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="app-avatar-chip h-9 w-9 shrink-0 rounded-md">
                        <FileIcon mimeType={file.mimeType} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="truncate text-sm font-medium text-foreground">{file.title}</p>
                          <span className="app-badge app-badge-muted px-1.5 py-0.5 text-[10px]">
                            {file.extension?.replace(".", "") || "file"}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{file.originalName}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <span className="app-badge app-badge-muted px-2 py-0.5 text-[11px] normal-case tracking-normal">{file.folder}</span>
                          <span className="app-badge app-badge-muted px-2 py-0.5 text-[11px] normal-case tracking-normal">{formatFileSize(file.sizeBytes)}</span>
                          {file.moduleName && (
                            <span className="app-badge app-badge-subtle px-2 py-0.5 text-[11px] normal-case tracking-normal">{file.moduleName}</span>
                          )}
                          {file.tags.map((tag) => (
                            <span key={tag} className="app-badge app-badge-muted px-2 py-0.5 text-[11px] normal-case tracking-normal">#{tag}</span>
                          ))}
                        </div>
                        {getFilePreviewKind(file.mimeType) === "image" && (
                          <button
                            type="button"
                            onClick={() => setPreviewFile(file)}
                            className="mt-2 block overflow-hidden rounded-md border border-border"
                          >
                            <img src={`/api/files/${file.id}`} alt={file.title} className="h-20 w-32 object-cover" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewFile(file)}
                        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-border px-2.5 py-1.5 text-xs font-medium transition hover:bg-muted"
                      >
                        <HiMiniEye className="h-3.5 w-3.5" />
                        Preview
                      </button>
                      <a
                        href={`/api/files/${file.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-border px-2.5 py-1.5 text-xs font-medium transition hover:bg-muted"
                      >
                        Open
                      </a>
                      <a
                        href={`/api/files/${file.id}?download=1`}
                        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-border px-2.5 py-1.5 text-xs font-medium transition hover:bg-muted"
                      >
                        <HiMiniArrowDownTray className="h-3.5 w-3.5" />
                        Download
                      </a>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => void remove(file.id)}
                          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-rose-300/40 px-2.5 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-500/10 dark:text-rose-400"
                        >
                          <HiMiniTrash className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Preview modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <button
            type="button"
            onClick={() => setPreviewFile(null)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Close preview"
          />

          <div className="relative z-10 flex w-full max-h-[92vh] flex-col overflow-hidden rounded-t-lg border border-white/10 bg-slate-950 text-white shadow-2xl sm:max-w-5xl sm:rounded-lg">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{previewFile.title}</p>
                <p className="truncate text-xs text-slate-400">{previewFile.originalName} · {formatFileSize(previewFile.sizeBytes)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={`/api/files/${previewFile.id}?download=1`}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10"
                >
                  <HiMiniArrowDownTray className="h-3.5 w-3.5" />
                  Download
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                  aria-label="Close"
                >
                  <HiMiniXMark className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden">
              <div className="flex min-h-[300px] flex-1 items-center justify-center bg-slate-900">
                {previewKind === "image" && (
                  <img
                    src={`/api/files/${previewFile.id}`}
                    alt={previewFile.title}
                    className="max-h-[60vh] rounded-md object-contain"
                  />
                )}
                {previewKind === "pdf" && (
                  <iframe
                    src={`/api/files/${previewFile.id}`}
                    title={previewFile.title}
                    className="h-[60vh] w-full bg-white"
                  />
                )}
                {!previewKind && (
                  <div className="text-center">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border border-white/10 bg-white/5 text-slate-400">
                      <HiMiniDocumentText className="h-6 w-6" />
                    </span>
                    <p className="mt-3 text-sm font-medium text-white">Preview not available</p>
                    <p className="mt-1 text-xs text-slate-400">Download or open in a new tab.</p>
                  </div>
                )}
              </div>

              <aside className="hidden w-56 shrink-0 border-l border-white/10 bg-slate-950 p-5 lg:block">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Details</h3>
                <div className="space-y-4 text-sm">
                  {[
                    { label: "Type",    value: previewFile.mimeType },
                    { label: "Size",    value: formatFileSize(previewFile.sizeBytes) },
                    { label: "Folder",  value: previewFile.folder },
                    { label: "Module",  value: previewFile.moduleName ?? "System" },
                    { label: "Uploaded", value: new Date(previewFile.createdAt).toLocaleDateString() },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="mt-0.5 text-xs font-medium text-white break-all">{value}</p>
                    </div>
                  ))}
                  {previewFile.tags.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-400">Tags</p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {previewFile.tags.map((tag) => (
                          <span key={tag} className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-300">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            </div>

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-between border-t border-white/10 px-5 py-3">
              <p className="text-xs text-slate-400">{previewFile.mimeType}</p>
              <a
                href={`/api/files/${previewFile.id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10"
              >
                Open in new tab
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
