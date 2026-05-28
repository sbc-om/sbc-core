export interface RequestContext {
  userId:   string;
  tenantId: string;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface HookContext {
  tenantId: string | null;
}

export interface InstallHookContext extends HookContext {
  isFirstInstall: boolean;
}

export interface UpgradeHookContext extends HookContext {
  fromVersion: string;
  toVersion:   string;
}

export interface UninstallHookContext extends HookContext {
  removeData: boolean;
}

export type PreInstallHook    = (ctx: InstallHookContext)   => Promise<void>;
export type PostInstallHook   = (ctx: InstallHookContext)   => Promise<void>;
export type PreUpgradeHook    = (ctx: UpgradeHookContext)   => Promise<void>;
export type PostUpgradeHook   = (ctx: UpgradeHookContext)   => Promise<void>;
export type PreUninstallHook  = (ctx: UninstallHookContext) => Promise<void>;
export type PostUninstallHook = (ctx: UninstallHookContext) => Promise<void>;
