"use client";

import { useRef, useState, useTransition } from "react";
import { HiMiniXMark } from "react-icons/hi2";
import { createConsoleUserAction } from "@/actions/users";
import { FilePickerDialog } from "@/components/documents/file-picker-dialog";
import { useToast } from "@/components/system-feedback";
import type { FileManagerItem } from "@/components/documents/types";

export function CreateUserDialog() {
  const [open, setOpen]            = useState(false);
  const [pending, startTransition] = useTransition();
  const [avatarFile, setAvatarFile] = useState<FileManagerItem | null>(null);
  const [avatarVisibility, setAvatarVisibility] = useState<"internal" | "tenant" | "public">("internal");
  const formRef = useRef<HTMLFormElement>(null);
  const toast   = useToast();

  function handleClose() {
    setOpen(false);
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createConsoleUserAction(formData);
      if (result?.error) {
        toast.error("Failed to create user", result.error);
      } else {
        formRef.current?.reset();
        setAvatarFile(null);
        setAvatarVisibility("internal");
        handleClose();
        toast.success("User created", "The new user is ready.");
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        + New User
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

          <div className="relative z-10 flex w-full max-h-[92vh] flex-col rounded-t-lg border border-border bg-background shadow-xl sm:max-w-lg sm:rounded-lg">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">New User</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Add a user to the platform directory.</p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <HiMiniXMark className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <form ref={formRef} id="create-user-form" action={handleSubmit} className="space-y-4">
                <input name="avatarDocumentId" value={avatarFile?.id ?? ""} readOnly hidden />
                <input name="avatarVisibility" value={avatarVisibility} readOnly hidden />

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Full Name</label>
                  <input
                    name="name"
                    required
                    placeholder="Jane Smith"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="jane@example.com"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    placeholder="Min. 8 characters"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
                  />
                </div>

                <div className="rounded-md border border-border bg-muted/30 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Profile photo</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Pick an image from the file library.
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

                  {avatarFile && (
                    <div className="mt-3 rounded-md border border-border bg-background p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={`/api/files/${avatarFile.id}`}
                          alt={avatarFile.title}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{avatarFile.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{avatarFile.originalName}</p>
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
              </form>
            </div>

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-6 py-4">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md border border-input px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="create-user-form"
                disabled={pending}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {pending ? "Creating…" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
