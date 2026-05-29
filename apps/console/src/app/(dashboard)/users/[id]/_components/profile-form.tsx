"use client";

import { useState, useTransition } from "react";
import { FilePickerDialog } from "@/components/documents/file-picker-dialog";
import { buildDocumentUrl, extractDocumentId } from "@/lib/documents";
import type { FileManagerItem } from "@/components/documents/types";

interface Props {
  user: {
    id:        string;
    name:      string;
    email:     string;
    avatarUrl: string | null;
  };
  initialAvatar: FileManagerItem | null;
  action(formData: FormData): Promise<void>;
}

export function ProfileForm({ user, initialAvatar, action }: Props) {
  const [avatarFile, setAvatarFile]   = useState<FileManagerItem | null>(initialAvatar);
  const [avatarVisibility, setAvatarVisibility] = useState<"internal" | "tenant" | "public">("internal");
  const [pending, startTransition]    = useTransition();
  const existingAvatarDocumentId      = extractDocumentId(user.avatarUrl);

  function submit(formData: FormData) {
    startTransition(async () => { await action(formData); });
  }

  return (
    <form action={submit} className="space-y-4">
      <input name="avatarDocumentId" value={avatarFile?.id ?? ""} readOnly hidden />
      <input name="avatarVisibility" value={avatarVisibility} readOnly hidden />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Full Name</label>
        <input
          name="name"
          defaultValue={user.name}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
        <input
          name="email"
          type="email"
          defaultValue={user.email}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          New Password
          <span className="ml-2 text-xs font-normal text-muted-foreground">(leave blank to keep)</span>
        </label>
        <input
          name="password"
          type="password"
          minLength={8}
          placeholder="••••••••"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
      </div>

      <div className="rounded-md border border-border bg-muted/30 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Profile photo</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Link an image from the file library.
            </p>
          </div>
          <FilePickerDialog
            buttonLabel={avatarFile ? "Replace" : "Choose"}
            title="Choose profile photo"
            description="Select or upload an image from the file manager."
            accept="image/*"
            initialFolder="users/avatars"
            uploadDefaults={{ folder: "users/avatars", moduleName: "iam", tags: "avatar,user-profile" }}
            selectedFileId={avatarFile?.id ?? null}
            onSelect={setAvatarFile}
          />
        </div>

        {(avatarFile || user.avatarUrl) && (
          <div className="mt-3 rounded-md border border-border bg-background p-3">
            <div className="flex items-center gap-3">
              <img
                src={
                  avatarFile
                    ? `/api/files/${avatarFile.id}`
                    : existingAvatarDocumentId
                      ? buildDocumentUrl(existingAvatarDocumentId, {
                          resourceModule: "iam",
                          resourceType: "user",
                          resourceId: user.id,
                          fieldName: "avatar",
                        })
                      : user.avatarUrl ?? ""
                }
                alt={avatarFile?.title ?? user.name}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {avatarFile?.title ?? user.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {avatarFile?.originalName ?? "Current photo"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAvatarFile(null)}
                className="shrink-0 rounded-md border border-input px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
              >
                Remove
              </button>
            </div>

            <div className="mt-3">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Visibility</label>
              <select
                value={avatarVisibility}
                onChange={(e) => setAvatarVisibility(e.target.value as "internal" | "tenant" | "public")}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              >
                <option value="internal">Internal (requires permission)</option>
                <option value="tenant">Tenant (any signed-in user)</option>
                <option value="public">Public (no sign-in needed)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
