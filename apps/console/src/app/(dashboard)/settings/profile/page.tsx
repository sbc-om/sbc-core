import { ProfileForm } from "../../users/[id]/_components/profile-form";
import { updateConsoleUserAction } from "@/actions/users";
import { SettingsSectionShell } from "../_components/settings-section-shell";
import { getCurrentSettingsUser } from "../_lib/current-user-settings";

export default async function ProfileSettingsPage() {
  const { user, initialAvatar } = await getCurrentSettingsUser();

  async function updateWithId(formData: FormData) {
    "use server";
    await updateConsoleUserAction(user.id, formData);
  }

  return (
    <SettingsSectionShell
      title="Profile"
      description="Manage your personal account details and profile image in a dedicated settings page."
    >
      <section className="rounded-lg border border-border/70 bg-background p-6 shadow-sm lg:p-8">
        <ProfileForm
          user={{ id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl }}
          initialAvatar={initialAvatar}
          action={updateWithId}
        />
      </section>
    </SettingsSectionShell>
  );
}
