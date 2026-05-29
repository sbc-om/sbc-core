"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  HiMiniArrowUpTray,
  HiMiniCheckCircle,
  HiMiniExclamationCircle,
  HiMiniXMark,
  HiMiniDocumentArrowUp,
} from "react-icons/hi2";

type UploadState =
  | { kind: "idle" }
  | { kind: "uploading"; progress: number }
  | { kind: "success"; name: string; title: string; version: string; author: string }
  | { kind: "error"; message: string };

interface Props {
  open:    boolean;
  onClose: () => void;
}

export function UploadModuleDialog({ open, onClose }: Props) {
  const router          = useRouter();
  const inputRef        = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>({ kind: "idle" });
  const [dragging, setDragging] = useState(false);

  const reset = useCallback(() => {
    setState({ kind: "idle" });
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleClose = useCallback(() => {
    if (state.kind === "uploading") return; // block close while uploading
    if (state.kind === "success") router.refresh();
    reset();
    onClose();
  }, [state, onClose, reset, router]);

  const uploadFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".zip")) {
      setState({ kind: "error", message: "Only .zip files are accepted." });
      return;
    }

    setState({ kind: "uploading", progress: 0 });

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Simulate progress with XHR for better UX
      const result = await new Promise<{ success?: boolean; manifest?: { name: string; title: string; version: string; author: string }; error?: string }>(
        (resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", "/api/modules/upload");

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setState({ kind: "uploading", progress: Math.round((e.loaded / e.total) * 90) });
            }
          };

          xhr.onload = () => {
            setState({ kind: "uploading", progress: 100 });
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error("Invalid server response"));
            }
          };

          xhr.onerror = () => reject(new Error("Network error during upload"));
          xhr.send(formData);
        },
      );

      if (result.error) {
        setState({ kind: "error", message: result.error });
      } else if (result.manifest) {
        setState({
          kind:    "success",
          name:    result.manifest.name,
          title:   result.manifest.title,
          version: result.manifest.version,
          author:  result.manifest.author,
        });
      }
    } catch (err) {
      setState({ kind: "error", message: err instanceof Error ? err.message : "Upload failed." });
    }
  }, []);

  const handleFiles = useCallback((files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    void uploadFile(file);
  }, [uploadFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  if (!open) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      {/* Dialog */}
      <div className="app-surface w-full max-w-md overflow-hidden shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted">
              <HiMiniDocumentArrowUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Upload Module</h2>
              <p className="text-xs text-muted-foreground">Install a module from a .zip package</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={state.kind === "uploading"}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
          >
            <HiMiniXMark className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">

          {/* ── Idle / Drop zone ───────────────────────────── */}
          {(state.kind === "idle" || state.kind === "error") && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={[
                  "flex w-full flex-col items-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors",
                  dragging
                    ? "border-foreground/30 bg-muted/60"
                    : "border-border hover:border-foreground/20 hover:bg-muted/30",
                ].join(" ")}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted">
                  <HiMiniArrowUpTray className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {dragging ? "Drop the file here" : "Drag & drop or click to browse"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">.zip package only · max 50 MB</p>
                </div>
              </button>

              <input
                ref={inputRef}
                type="file"
                accept=".zip"
                className="sr-only"
                onChange={(e) => handleFiles(e.target.files)}
              />

              {state.kind === "error" && (
                <div className="flex items-start gap-2.5 rounded-lg border border-rose-200/70 bg-rose-50/60 px-4 py-3 dark:border-rose-400/20 dark:bg-rose-500/10">
                  <HiMiniExclamationCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <p className="text-xs text-rose-700 dark:text-rose-300">{state.message}</p>
                </div>
              )}

              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                <p className="text-[11px] font-medium text-foreground">Required zip structure</p>
                <pre className="mt-1.5 font-mono text-[10px] leading-relaxed text-muted-foreground">
                  {`crm-1.0.0.zip\n├── manifest.json   ← required\n└── migrations/\n    └── 0001_*.sql  ← optional`}
                </pre>
              </div>
            </div>
          )}

          {/* ── Uploading ──────────────────────────────────── */}
          {state.kind === "uploading" && (
            <div className="space-y-4 py-4">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="relative flex h-14 w-14 items-center justify-center">
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="text-border" />
                    <circle
                      cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 20}`}
                      strokeDashoffset={`${2 * Math.PI * 20 * (1 - state.progress / 100)}`}
                      strokeLinecap="round"
                      className="text-foreground transition-all duration-200"
                    />
                  </svg>
                  <span className="text-xs font-bold tabular-nums text-foreground">{state.progress}%</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Uploading package…</p>
                  <p className="mt-1 text-xs text-muted-foreground">Extracting and validating module</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Success ────────────────────────────────────── */}
          {state.kind === "success" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
                  <HiMiniCheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Module uploaded successfully</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    You can now install it from the marketplace.
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 space-y-1.5">
                <Row label="Name"    value={state.name} />
                <Row label="Title"   value={state.title} />
                <Row label="Version" value={`v${state.version}`} />
                <Row label="Author"  value={state.author} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
          {state.kind === "success" ? (
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-foreground bg-foreground px-4 text-xs font-semibold text-background shadow-sm hover:opacity-92"
            >
              <HiMiniCheckCircle className="h-3.5 w-3.5" />
              Done — Go to Marketplace
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleClose}
                disabled={state.kind === "uploading"}
                className="inline-flex h-9 items-center rounded-md border border-border px-4 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-40"
              >
                Cancel
              </button>
              {state.kind === "error" && (
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex h-9 items-center rounded-md border border-foreground bg-foreground px-4 text-xs font-semibold text-background hover:opacity-92"
                >
                  Try Again
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="font-mono text-[11px] font-medium text-foreground">{value}</span>
    </div>
  );
}
