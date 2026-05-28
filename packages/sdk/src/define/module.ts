import type { ModuleManifest } from "../types/manifest";

export function defineModule(manifest: ModuleManifest): ModuleManifest {
  return {
    installable:  true,
    application:  false,
    auto_install: false,
    depends:      ["base"],
    ...manifest,
  };
}
