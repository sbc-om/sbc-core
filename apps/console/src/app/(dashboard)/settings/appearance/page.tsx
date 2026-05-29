import { ThemeAppearancePanel } from "../_components/theme-appearance-panel";
import { SettingsSectionShell } from "../_components/settings-section-shell";

export default function AppearanceSettingsPage() {
  return (
    <SettingsSectionShell
      title="Appearance"
      description="Switch the console theme and keep the interface consistent across the app."
    >
      <ThemeAppearancePanel />
    </SettingsSectionShell>
  );
}
