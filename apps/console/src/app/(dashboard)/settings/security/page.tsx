import { updateConsoleUserAction } from "@/actions/users";
import { SettingsSectionShell } from "../_components/settings-section-shell";
import { SecuritySettingsForm } from "../_components/security-settings-form";
import { getCurrentSettingsUser } from "../_lib/current-user-settings";

export default async function SecuritySettingsPage() {
  const { user } = await getCurrentSettingsUser();

  async function updatePassword(formData: FormData) {
    "use server";
    await updateConsoleUserAction(user.id, formData);
  }

  return (
    <SettingsSectionShell
      title="Security"
      description="Keep sign-in credentials and account protection in a dedicated settings page."
    >
      <section className="rounded-lg border border-border/70 bg-background p-6 shadow-sm lg:p-8">
        <SecuritySettingsForm
          email={user.email}
          action={updatePassword}
        />
      </section>
    </SettingsSectionShell>
  );
}