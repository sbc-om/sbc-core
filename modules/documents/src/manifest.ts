import { defineModule } from "@sbc/sdk";

export const manifest = defineModule({
  name:        "documents",
  title:       "File Manager",
  description: "Centralized file upload, storage, and lifecycle management for the whole platform.",
  version:     "1.0.0",
  author:      "SBC Team",
  category:    "system",
  depends:     ["base"],

  permissions: [
    { key: "documents.files.view", label: "View the file manager" },
    { key: "documents.files.upload", label: "Upload files into the file manager" },
    { key: "documents.files.delete", label: "Delete files from the file manager" },
  ],

  menus: [
    {
      key:        "documents.files",
      label:      "Files",
      icon:       "FolderOpen",
      href:       "/files",
      order:      8,
      permission: "documents.files.view",
    },
  ],
});