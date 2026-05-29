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
  buttonLabel?: string;
  title?: string;
  description?: string;
  selectedFileId?: string | null;
  accept?: string;
  initialFolder?: string;
  uploadDefaults?: {
    folder?: string;
    moduleName?: string;
    tags?: string;
  };
  onSelect(file: FileManagerItem): void;
}

function matchesAccept(file: Pick<FileManagerItem, "mimeType" | "extension">, accept: string | undefined) {
  if (!accept?.trim()) return true;

  const tokens = accept
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);

  if (tokens.length === 0) return true;

  const mimeType = file.mimeType.toLowerCase();
  const extension = file.extension ? `.${file.extension.toLowerCase()}` : "";

  return tokens.some((token) => {
    if (token.endsWith("/*")) {
      return mimeType.startsWith(token.slice(0, -1));
    }

    if (token.startsWith(".")) {
      return extension === token;
    }

    return mimeType === token;
  });
}

function fileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) {
    return <HiMiniPhoto className="h-5 w-5" />;
  }

  return <HiMiniDocumentText className="h-5 w-5" />;
}

export function FilePickerDialog({
  buttonLabel = "Select file",
  title = "Choose file from library",
  description = "Search the central file manager or upload a new asset inline, then attach it immediately.",
  selectedFileId,
  accept,
  initialFolder,
  uploadDefaults,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<FileManagerItem[]>([]);
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState(initialFolder?.trim() || "all");
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFolder, setUploadFolder] = useState(uploadDefaults?.folder ?? "");
  const [uploadModuleName, setUploadModuleName] = useState(uploadDefaults?.moduleName ?? "");
  const [uploadTags, setUploadTags] = useState(uploadDefaults?.tags ?? "");
  const [uploadPending, startUploadTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const deferredQuery = useDeferredValue(query);
  const toast = useToast();

  const visibleFiles = useMemo(() => files.filter((file) => matchesAccept(file, accept)), [accept, files]);

  const folders = useMemo(() => {
    return ["all", ...Array.from(new Set(files.map((file) => file.folder))).sort()];
  }, [files]);

  useEffect(() => {
    setFolder(initialFolder?.trim() || "all");
  }, [initialFolder]);

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

        const response = await fetch(`/api/files?${params.toString()}`, { cache: "no-store" });
        const payload = (await response.json()) as {
          error?: string;
          files?: FileManagerItem[];
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to load file library");
        }

        if (!cancelled) {
          setFiles(payload.files ?? []);
        }
      } catch (requestError) {
        if (!cancelled) {
          toast.error("Library load failed", requestError instanceof Error ? requestError.message : "Unable to load file library");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, deferredQuery, folder, refreshKey]);

  function resetUploadForm() {
    setUploadFile(null);
    setUploadTitle("");
    setUploadFolder(uploadDefaults?.folder ?? "");
    setUploadModuleName(uploadDefaults?.moduleName ?? "");
    setUploadTags(uploadDefaults?.tags ?? "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleUpload() {
    if (!uploadFile) {
      toast.info("No file selected", "Choose a file to upload.");
      return;
    }

    startUploadTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("files", uploadFile);

        if (uploadTitle.trim()) formData.append("title", uploadTitle.trim());
        if (uploadFolder.trim()) formData.append("folder", uploadFolder.trim());
        if (uploadModuleName.trim()) formData.append("moduleName", uploadModuleName.trim());
        if (uploadTags.trim()) formData.append("tags", uploadTags.trim());

        const response = await fetch("/api/files", {
          method: "POST",
          body: formData,
        });

        const payload = (await response.json()) as {
          error?: string;
          files?: FileManagerItem[];
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to upload file");
        }

        const createdFile = payload.files?.[0];
        if (!createdFile) {
          throw new Error("Upload completed but no file was returned.");
        }

        setRefreshKey((value) => value + 1);
        resetUploadForm();
        onSelect(createdFile);
        setOpen(false);
        toast.success("File uploaded", "The new asset is ready and selected.");
      } catch (requestError) {
        toast.error("Upload failed", requestError instanceof Error ? requestError.message : "Unable to upload file");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-muted"
      >
        <HiMiniFolderOpen className="h-4 w-4" />
        {buttonLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
            aria-label="Close file picker"
          />

          <div className="relative z-10 flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-[1.75rem] border border-border bg-background shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Reusable input</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">{title}</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-500">{description}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-muted"
              >
                <HiMiniXMark className="h-4 w-4" />
                Close
              </button>
            </div>

            <div className="border-b border-border px-6 py-4">
              <div className="flex flex-col gap-3 md:flex-row">
                <label className="relative block flex-1">
                  <HiMiniMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search file library"
                    className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 outline-none transition focus:border-teal-500"
                  />
                </label>
                <select
                  value={folder}
                  onChange={(event) => setFolder(event.target.value)}
                  className="rounded-xl border border-border bg-background px-3 py-2.5 outline-none transition focus:border-teal-500 md:w-52"
                >
                  {folders.map((item) => (
                    <option key={item} value={item}>
                      {item === "all" ? "All folders" : item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1.45fr_0.9fr]">
              <div className="min-h-0 border-b border-border lg:border-b-0 lg:border-r">
                <div className="flex-1 overflow-y-auto px-6 py-5">
              {loading ? (
                <div className="rounded-2xl border border-border bg-slate-50 p-10 text-center text-sm text-slate-500">Loading file library...</div>
              ) : visibleFiles.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-10 text-center">
                  <p className="text-base font-semibold text-slate-900">No files found</p>
                  <p className="mt-2 text-sm text-slate-500">Try another search, folder filter, or upload a new file.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {visibleFiles.map((file) => {
                    const previewKind = getFilePreviewKind(file.mimeType);
                    const isSelected = file.id === selectedFileId;

                    return (
                      <button
                        key={file.id}
                        type="button"
                        onClick={() => {
                          onSelect(file);
                          setOpen(false);
                        }}
                        className={`grid gap-4 rounded-[1.25rem] border p-4 text-left transition hover:border-teal-300 hover:bg-teal-50/30 lg:grid-cols-[120px_1fr_auto] ${isSelected ? "border-teal-300 bg-teal-50/40" : "border-border bg-white"}`}
                      >
                        <div className="overflow-hidden rounded-2xl border border-border bg-slate-50">
                          {previewKind === "image" ? (
                            <img src={`/api/files/${file.id}`} alt={file.title} className="h-24 w-full object-cover" />
                          ) : (
                            <div className="flex h-24 items-center justify-center text-slate-500">
                              {fileIcon(file.mimeType)}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-sm font-semibold text-slate-950">{file.title}</h3>
                            {isSelected && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-700">
                                <HiMiniCheckCircle className="h-3.5 w-3.5" />
                                Selected
                              </span>
                            )}
                          </div>
                          <p className="mt-1 truncate text-sm text-slate-500">{file.originalName}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-slate-600">{file.folder}</span>
                            <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-slate-600">{formatFileSize(file.sizeBytes)}</span>
                            {file.moduleName && (
                              <span className="rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">{file.moduleName}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/api/files/${file.id}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => event.stopPropagation()}
                            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-muted"
                          >
                            <HiMiniArrowTopRightOnSquare className="h-4 w-4" />
                            Open
                          </a>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
                </div>
              </div>

              <div className="border-border bg-slate-50/60 px-6 py-5">
                <div className="rounded-[1.5rem] border border-dashed border-teal-200 bg-white p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-teal-50 p-3 text-teal-700">
                      <HiMiniCloudArrowUp className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">Upload and select</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Add a new file without leaving this form. The uploaded file is immediately available in the shared library.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                        File
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
                        className="block w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-teal-700"
                      />
                      {uploadFile && (
                        <div className="rounded-xl border border-border bg-slate-50 px-3 py-2 text-xs text-slate-600">
                          {uploadFile.name} · {formatFileSize(uploadFile.size)}
                        </div>
                      )}
                    </div>

                    <label className="block space-y-2">
                      <span className="block text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Title</span>
                      <input
                        value={uploadTitle}
                        onChange={(event) => setUploadTitle(event.target.value)}
                        placeholder="Optional display title"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-teal-500"
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="block text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Folder</span>
                      <input
                        value={uploadFolder}
                        onChange={(event) => setUploadFolder(event.target.value)}
                        placeholder="avatars, users, contracts"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-teal-500"
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="block text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Module</span>
                      <input
                        value={uploadModuleName}
                        onChange={(event) => setUploadModuleName(event.target.value)}
                        placeholder="iam, crm, documents"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-teal-500"
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="block text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Tags</span>
                      <input
                        value={uploadTags}
                        onChange={(event) => setUploadTags(event.target.value)}
                        placeholder="profile, onboarding"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-teal-500"
                      />
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={resetUploadForm}
                        className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-muted"
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        disabled={uploadPending || !uploadFile}
                        onClick={handleUpload}
                        className="flex-1 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                      >
                        {uploadPending ? "Uploading..." : "Upload and select"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}