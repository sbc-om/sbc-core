export interface FileManagerItem {
  id: string;
  title: string;
  originalName: string;
  folder: string;
  moduleName: string | null;
  mimeType: string;
  extension: string | null;
  sizeBytes: number;
  tags: string[];
  createdAt: string;
}

export interface FileManagerStats {
  totalFiles: number;
  totalSizeBytes: number;
  recentUploads: number;
  folderCount: number;
}

export function formatFileSize(sizeBytes: number): string {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(1)} KB`;
  if (sizeBytes < 1024 * 1024 * 1024) return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(sizeBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function getFilePreviewKind(mimeType: string): "image" | "pdf" | null {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  return null;
}