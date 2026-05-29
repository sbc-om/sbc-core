"use client";

import { useState, useTransition } from "react";
import { FilePickerDialog } from "@/components/documents/file-picker-dialog";
import { buildDocumentUrl, extractDocumentId } from "@/lib/documents";
import type { FileManagerItem } from "@/components/documents/types";

interface Props {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  initialAvatar: FileManagerItem | null;
  action(formData: FormData): Promise<void>;
}

export function ProfileForm({ user, initialAvatar, action }: Props) {
  const [avatarFile, setAvatarFile] = useState<FileManagerItem | null>(initialAvatar);
  const [avatarVisibility, setAvatarVisibility] = useState<"internal" | "tenant" | "public">("internal");
  const [pending, startTransition] = useTransition();
  const existingAvatarDocumentId = extractDocumentId(user.avatarUrl);

  function submit(formData: FormData) {
    startTransition(async () => {
      await action(formData);
    });
  }

  return (
    <form action={submit} className="space-y-4">
      <input name="avatarDocumentId" value={avatarFile?.id ?? ""} readOnly hidden />
      <input name="avatarVisibility" value={avatarVisibility} readOnly hidden />

      <div>
        <label className="mb-1 block text-sm font-medium">Full Name</label>
        <input
          name="name"
          defaultValue={user.name}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <input
          name="email"
          type="email"
          defaultValue={user.email}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">New Password <span className="text-muted-foreground font-normal">(leave blank to keep)</span></label>
        <input
          name="password"
          type="password"
          minLength={8}
          placeholder="••••••••"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Avatar attachment</label>
            <p className="text-xs leading-5 text-muted-foreground">
              Link this user to an image from the central file library. The relation is stored separately from the user record.
            </p>
          </div>
          <FilePickerDialog
            buttonLabel={avatarFile ? "Replace avatar" : "Choose avatar"}
            title="Choose user avatar"
            description="Select a file from the global file manager or upload one inline, then link it to this user profile."
            accept="image/*"
            initialFolder="users/avatars"
            uploadDefaults={{
              folder: "users/avatars",
              moduleName: "iam",
              tags: "avatar,user-profile",
            }}
            selectedFileId={avatarFile?.id ?? null}
            onSelect={setAvatarFile}
          />
        </div>

        {(avatarFile || user.avatarUrl) && (
          <div className="mt-4 space-y-3 rounded-lg border border-border bg-background px-3 py-3">
            <div className="flex items-center gap-3">
              <img
                src={avatarFile
                  ? `/api/files/${avatarFile.id}`
                  : existingAvatarDocumentId
                    ? buildDocumentUrl(existingAvatarDocumentId, {
                        resourceModule: "iam",
                        resourceType: "user",
                        resourceId: user.id,
                        fieldName: "avatar",
                      })
                    : user.avatarUrl ?? ""}
                alt={avatarFile?.title ?? user.name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{avatarFile?.title ?? user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{avatarFile?.originalName ?? "Current linked avatar"}</p>
              </div>
              <button
                type="button"
                onClick={() => setAvatarFile(null)}
                className="rounded-md border border-input px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
              >
                Remove
              </button>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Visibility</label>
              <select
                value={avatarVisibility}
                onChange={(event) => setAvatarVisibility(event.target.value as "internal" | "tenant" | "public")}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="internal">Internal: requires files permission</option>
                <option value="tenant">Tenant: any signed-in user in this tenant</option>
                <option value="public">Public: accessible without sign-in</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {pending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}