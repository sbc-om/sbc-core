import type { PermissionDescriptor } from "../types/manifest";

export function definePermission(key: string, label: string): PermissionDescriptor {
  return { key, label };
}
