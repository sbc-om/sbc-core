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
  HiMiniPaperAirplane,
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

interface Props {
  initialFiles: FileManagerItem[];
  initialStats: FileManagerStats;
  canUpload: boolean;
  canDelete: boolean;
}

function fileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) {
    return <HiMiniPhoto className="h-5 w-5" />;
  }

  return <HiMiniDocumentText className="h-5 w-5" />;
}

export function FileManager({ initialFiles, initialStats, canUpload, canDelete }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState(initialFiles);
  const [stats, setStats] = useState(initialStats);
  const [query, setQuery] = useState("");
  const [activeFolder, setActiveFolder] = useState("all");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [folderInput, setFolderInput] = useState("general");
  const [moduleName, setModuleName] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<FileManagerItem | null>(null);
  const deferredQuery = useDeferredValue(query);

  const folders = useMemo(() => {
    return ["all", ...Array.from(new Set(files.map((file) => file.folder))).sort()];
  }, [files]);

  async function refresh(nextQuery = deferredQuery, nextFolder = activeFolder) {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (nextQuery.trim()) params.set("query", nextQuery.trim());
      if (nextFolder !== "all") params.set("folder", nextFolder);

      const response = await fetch(`/api/files?${params.toString()}`, { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load files");
      }

      startTransition(() => {
        setFiles(payload.files);
        setStats(payload.stats);
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load files");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh(deferredQuery, activeFolder);
  }, [deferredQuery, activeFolder]);

  function selectFiles(nextFiles: File[]) {
    setSelectedFiles(nextFiles);
    if (nextFiles.length > 1) {
      setTitle("");
    }
    if (nextFiles.length === 1 && !title.trim()) {
      setTitle(nextFiles[0]?.name.replace(/\.[^.]+$/, "") ?? "");
    }
  }

  function onFileInput(event: ChangeEvent<HTMLInputElement>) {
    selectFiles(Array.from(event.target.files ?? []));
  }

  function onDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setDragging(false);
    selectFiles(Array.from(event.dataTransfer.files ?? []));
  }

  async function upload() {
    if (!selectedFiles.length) {
      setError("Choose at least one file to upload.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const body = new FormData();
      selectedFiles.forEach((file) => body.append("files", file));
      if (title.trim() && selectedFiles.length === 1) body.set("title", title.trim());
      if (folderInput.trim()) body.set("folder", folderInput.trim());
      if (moduleName.trim()) body.set("moduleName", moduleName.trim());
      if (tags.trim()) body.set("tags", tags.trim());

      const response = await fetch("/api/files", { method: "POST", body });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to upload files");
      }

      setSelectedFiles([]);
      setTitle("");
      if (inputRef.current) {
        inputRef.current.value = "";
      }

      await refresh(query, activeFolder);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to upload files");
    } finally {
      setUploading(false);
    }
  }

  async function remove(id: string) {
    const confirmed = window.confirm("Delete this file from the system file manager?");
    if (!confirmed) return;

    setError(null);

    try {
      const response = await fetch(`/api/files/${id}`, { method: "DELETE" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to delete file");
      }

      await refresh(query, activeFolder);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to delete file");
    }
  }

  const previewKind = previewFile ? getFilePreviewKind(previewFile.mimeType) : null;

  return (
    <>
      <div className="space-y-6">
      <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.14),_transparent_36%),linear-gradient(135deg,_#ffffff_0%,_#f5fbfa_48%,_#eef8f6_100%)] p-7">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-teal-200/80 bg-white/70 text-teal-700 shadow-sm">
              <HiMiniFolderOpen className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700/80">System Asset Layer</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Global File Manager</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Central upload, retrieval, and lifecycle control for files used across modules, operations, and tenant workflows.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Files</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{stats.totalFiles}</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Storage</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{formatFileSize(stats.totalSizeBytes)}</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Recent 7d</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{stats.recentUploads}</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Folders</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{stats.folderCount}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_1.85fr]">
        <div className="rounded-[1.5rem] border border-border bg-background p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Upload console</h2>
              <p className="mt-1 text-sm text-slate-500">Drop one or more files, then attach system metadata before publishing.</p>
            </div>
            <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {canUpload ? "Enabled" : "Read only"}
            </span>
          </div>

          <button
            type="button"
            disabled={!canUpload}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              if (canUpload) setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`mt-5 flex min-h-52 w-full flex-col items-center justify-center rounded-[1.5rem] border border-dashed px-6 py-10 text-center transition ${dragging ? "border-teal-500 bg-teal-50" : "border-slate-300 bg-slate-50/80"} ${!canUpload ? "cursor-not-allowed opacity-60" : "hover:border-teal-400 hover:bg-teal-50/50"}`}
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white bg-white text-teal-700 shadow-sm">
              <HiMiniCloudArrowUp className="h-7 w-7" />
            </span>
            <p className="mt-4 text-base font-semibold text-slate-900">Drag files here or browse from device</p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Keep shared assets, customer attachments, signed documents, and internal references in one controlled surface.
            </p>
          </button>

          <input ref={inputRef} type="file" multiple className="hidden" onChange={onFileInput} />

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">Display title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={!canUpload || selectedFiles.length > 1}
                placeholder="Contract package"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none transition focus:border-teal-500"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">Folder</span>
              <input
                value={folderInput}
                onChange={(event) => setFolderInput(event.target.value)}
                disabled={!canUpload}
                placeholder="general"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none transition focus:border-teal-500"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">Source module</span>
              <input
                value={moduleName}
                onChange={(event) => setModuleName(event.target.value)}
                disabled={!canUpload}
                placeholder="crm"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none transition focus:border-teal-500"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">Tags</span>
              <input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                disabled={!canUpload}
                placeholder="contract, signed, customer"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none transition focus:border-teal-500"
              />
            </label>
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-slate-50/80 p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-slate-800">Selected payload</p>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{selectedFiles.length} items</span>
            </div>
            <div className="mt-3 space-y-2">
              {selectedFiles.length === 0 ? (
                <p className="text-sm text-slate-500">No files queued yet.</p>
              ) : (
                selectedFiles.map((file) => (
                  <div key={`${file.name}-${file.size}`} className="flex items-center justify-between gap-3 rounded-xl border border-white bg-white px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        {fileIcon(file.type || "application/octet-stream")}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{file.name}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4">
            <p className="text-xs leading-5 text-slate-500">Uploads stay private to authenticated users and are served through permission-checked endpoints.</p>
            <button
              type="button"
              disabled={!canUpload || uploading}
              onClick={() => void upload()}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <HiMiniCloudArrowUp className="h-4 w-4" />
              {uploading ? "Uploading..." : "Upload files"}
            </button>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-border bg-background p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Asset catalog</h2>
              <p className="mt-1 text-sm text-slate-500">Search, filter, open, and retire files used across the platform.</p>
            </div>
            <div className="flex flex-col gap-3 md:flex-row">
              <label className="relative block">
                <HiMiniMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by file, folder, or module"
                  className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 outline-none transition focus:border-teal-500 md:w-72"
                />
              </label>

              <select
                value={activeFolder}
                onChange={(event) => setActiveFolder(event.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2.5 outline-none transition focus:border-teal-500"
              >
                {folders.map((folder) => (
                  <option key={folder} value={folder}>
                    {folder === "all" ? "All folders" : folder}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="mt-5 space-y-3">
            {loading ? (
              <div className="rounded-2xl border border-border bg-slate-50 p-10 text-center text-sm text-slate-500">Refreshing catalog...</div>
            ) : files.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-10 text-center">
                <p className="text-base font-semibold text-slate-900">No files matched the current view.</p>
                <p className="mt-2 text-sm text-slate-500">Upload a new asset or clear the filters to expand the catalog.</p>
              </div>
            ) : (
              files.map((file) => (
                <div key={file.id} className="rounded-[1.25rem] border border-border bg-white p-4 shadow-sm transition hover:border-slate-300">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-slate-50 text-slate-600">
                        {fileIcon(file.mimeType)}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-slate-950">{file.title}</h3>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                            {file.extension?.replace(".", "") || "file"}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-sm text-slate-500">{file.originalName}</p>
                        {getFilePreviewKind(file.mimeType) === "image" && (
                          <button
                            type="button"
                            onClick={() => setPreviewFile(file)}
                            className="mt-3 block overflow-hidden rounded-2xl border border-border bg-slate-50 transition hover:border-teal-300"
                          >
                            <img
                              src={`/api/files/${file.id}`}
                              alt={file.title}
                              className="h-24 w-40 object-cover"
                            />
                          </button>
                        )}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-slate-600">Folder: {file.folder}</span>
                          {file.moduleName && (
                            <span className="rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">Module: {file.moduleName}</span>
                          )}
                          {file.tags.map((tag) => (
                            <span key={tag} className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 lg:items-end">
                      <div className="text-sm text-slate-500">
                        <p>{formatFileSize(file.sizeBytes)}</p>
                        <p>{new Date(file.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewFile(file)}
                          className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-muted"
                        >
                          <HiMiniEye className="h-4 w-4" />
                          Preview
                        </button>
                        <a
                          href={`/api/files/${file.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-muted"
                        >
                          Open
                        </a>
                        <a
                          href={`/api/files/${file.id}?download=1`}
                          className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-muted"
                        >
                          <HiMiniArrowDownTray className="h-4 w-4" />
                          Download
                        </a>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => void remove(file.id)}
                            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                          >
                            <HiMiniTrash className="h-4 w-4" />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
      </div>

      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setPreviewFile(null)}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            aria-label="Close preview"
          />

          <div className="relative z-10 flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950 text-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-300">Preview</p>
                <h2 className="mt-2 truncate text-xl font-semibold">{previewFile.title}</h2>
                <p className="mt-1 truncate text-sm text-slate-300">{previewFile.originalName}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={`/api/files/${previewFile.id}?download=1`}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  <HiMiniArrowDownTray className="h-4 w-4" />
                  Download
                </a>
                <a
                  href={`/api/files/${previewFile.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  <HiMiniPaperAirplane className="h-4 w-4" />
                  Open tab
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  <HiMiniXMark className="h-4 w-4" />
                  Close
                </button>
              </div>
            </div>

            <div className="grid flex-1 gap-0 lg:grid-cols-[1.8fr_0.8fr]">
              <div className="min-h-[26rem] bg-slate-900">
                {previewKind === "image" && (
                  <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.22),_transparent_35%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(2,6,23,1))] p-6">
                    <img
                      src={`/api/files/${previewFile.id}`}
                      alt={previewFile.title}
                      className="max-h-[72vh] rounded-2xl object-contain shadow-2xl"
                    />
                  </div>
                )}

                {previewKind === "pdf" && (
                  <iframe
                    src={`/api/files/${previewFile.id}`}
                    title={previewFile.title}
                    className="h-[72vh] w-full bg-white"
                  />
                )}

                {!previewKind && (
                  <div className="flex h-full items-center justify-center p-8">
                    <div className="max-w-md rounded-[1.5rem] border border-white/10 bg-white/5 p-8 text-center">
                      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200">
                        <HiMiniDocumentText className="h-7 w-7" />
                      </span>
                      <h3 className="mt-4 text-lg font-semibold text-white">Preview not available</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        This file type cannot be rendered inline yet. Open it in a new tab or download it from the actions on the right.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <aside className="border-t border-white/10 bg-slate-950/90 p-6 lg:border-l lg:border-t-0">
                <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Metadata</h3>
                <div className="mt-5 space-y-4 text-sm">
                  <div>
                    <p className="text-slate-400">Type</p>
                    <p className="mt-1 font-medium text-white">{previewFile.mimeType}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Size</p>
                    <p className="mt-1 font-medium text-white">{formatFileSize(previewFile.sizeBytes)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Folder</p>
                    <p className="mt-1 font-medium text-white">{previewFile.folder}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Module</p>
                    <p className="mt-1 font-medium text-white">{previewFile.moduleName ?? "System"}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Uploaded</p>
                    <p className="mt-1 font-medium text-white">{new Date(previewFile.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Tags</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {previewFile.tags.length === 0 ? (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">No tags</span>
                      ) : (
                        previewFile.tags.map((tag) => (
                          <span key={tag} className="rounded-full border border-teal-400/20 bg-teal-400/10 px-2.5 py-1 text-xs font-medium text-teal-200">
                            #{tag}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}
    </>
  );
}