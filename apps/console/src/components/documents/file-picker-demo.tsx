"use client";

import { useState } from "react";
import { HiMiniCheckBadge, HiMiniLink } from "react-icons/hi2";
import { FilePickerDialog } from "./file-picker-dialog";
import { formatFileSize, type FileManagerItem } from "./types";

export function FilePickerDemo() {
  const [selectedFile, setSelectedFile] = useState<FileManagerItem | null>(null);

  return (
    <section className="rounded-[1.5rem] border border-border bg-background p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Cross-module primitive</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Reusable file picker</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Client forms across CRM, HR, insurance, and other modules can call the shared file library instead of creating their own upload surfaces.
          </p>
        </div>

        <FilePickerDialog
          buttonLabel={selectedFile ? "Replace selected file" : "Choose from library"}
          selectedFileId={selectedFile?.id ?? null}
          onSelect={setSelectedFile}
        />
      </div>

      <div className="mt-5 rounded-[1.25rem] border border-dashed border-slate-300 bg-slate-50/60 p-5">
        {selectedFile ? (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                  <HiMiniCheckBadge className="h-4 w-4" />
                  Attached asset
                </span>
                <span className="rounded-full border border-border bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                  {selectedFile.folder}
                </span>
              </div>
              <h3 className="mt-3 truncate text-lg font-semibold text-slate-950">{selectedFile.title}</h3>
              <p className="mt-1 truncate text-sm text-slate-500">{selectedFile.originalName}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span>{formatFileSize(selectedFile.sizeBytes)}</span>
              <span>{new Date(selectedFile.createdAt).toLocaleDateString()}</span>
              <a
                href={`/api/files/${selectedFile.id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 font-medium text-slate-700 transition hover:bg-muted"
              >
                <HiMiniLink className="h-4 w-4" />
                Open asset
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h3 className="text-base font-semibold text-slate-900">No file attached yet</h3>
            <p className="mt-2 text-sm text-slate-500">
              Use the picker above to simulate how any module form can reference a shared file from the central library.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}