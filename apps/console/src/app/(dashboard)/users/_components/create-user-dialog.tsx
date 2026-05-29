"use client";

import { useRef, useState, useTransition } from "react";
import { createConsoleUserAction } from "@/actions/users";
import { FilePickerDialog } from "@/components/documents/file-picker-dialog";
import { useToast } from "@/components/system-feedback";
import type { FileManagerItem } from "@/components/documents/types";

export function CreateUserDialog() {
  const [open, setOpen]           = useState(false);
  const [pending, startTransition] = useTransition();
  const [avatarFile, setAvatarFile] = useState<FileManagerItem | null>(null);
  const [avatarVisibility, setAvatarVisibility] = useState<"internal" | "tenant" | "public">("internal");
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useToast();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createConsoleUserAction(formData);
      if (result?.error) {
        toast.error("User creation failed", result.error);
      } else {
        formRef.current?.reset();
        setAvatarFile(null);
        setAvatarVisibility("internal");
        setOpen(false);
        toast.success("User created", "The new user is now available in the directory.");
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        + New User
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">Create User</h2>

            <form ref={formRef} action={handleSubmit} className="space-y-4">
              <input name="avatarDocumentId" value={avatarFile?.id ?? ""} readOnly hidden />
              <input name="avatarVisibility" value={avatarVisibility} readOnly hidden />

              <div>
                <label className="mb-1 block text-sm font-medium">Full Name</label>
                <input
                  name="name"
                  required
                  placeholder="Jane Smith"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="jane@example.com"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Avatar from file library</label>
                    <p className="text-xs leading-5 text-muted-foreground">
                      Reuse an existing image from the central file manager instead of uploading a new one.
                    </p>
                  </div>
                  <FilePickerDialog
                    buttonLabel={avatarFile ? "Replace avatar" : "Choose avatar"}
                    title="Choose user avatar"
                    description="Pick an image from the global file manager or upload one inline for this user profile."
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

                {avatarFile && (
                  <div className="mt-4 space-y-3 rounded-lg border border-border bg-background px-3 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={`/api/files/${avatarFile.id}`}
                        alt={avatarFile.title}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{avatarFile.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{avatarFile.originalName}</p>
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
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-input px-4 py-2 text-sm hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {pending ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
