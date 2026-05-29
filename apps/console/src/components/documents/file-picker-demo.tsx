"use client";

import { useState } from "react";
import { HiMiniCheckCircle, HiMiniLink } from "react-icons/hi2";
import { FilePickerDialog } from "./file-picker-dialog";
import { formatFileSize, type FileManagerItem } from "./types";

export function FilePickerDemo() {
  const [selectedFile, setSelectedFile] = useState<FileManagerItem | null>(null);

  return (
    <div className="rounded-lg border border-border bg-background p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Shared File Picker</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Any module form can reference files from the central library using this picker.
          </p>
        </div>
        <FilePickerDialog
          buttonLabel={selectedFile ? "Replace" : "Choose from library"}
          selectedFileId={selectedFile?.id ?? null}
          onSelect={setSelectedFile}
        />
      </div>

      <div className="mt-4 rounded-md border border-dashed border-border bg-muted/20 p-4">
        {selectedFile ? (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-green-200 bg-green-50 text-green-600">
                <HiMiniCheckCircle className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{selectedFile.title}</p>
                <p className="text-xs text-muted-foreground">{selectedFile.folder} · {formatFileSize(selectedFile.sizeBytes)}</p>
              </div>
            </div>
            <a
              href={`/api/files/${selectedFile.id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
            >
              <HiMiniLink className="h-3.5 w-3.5" />
              Open
            </a>
          </div>
        ) : (
          <p className="text-center text-xs text-muted-foreground">
            No file selected. Use the picker above to attach a file from the library.
          </p>
        )}
      </div>
    </div>
  );
}
