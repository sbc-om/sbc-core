"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  HiCheckCircle,
  HiExclamationTriangle,
  HiInformationCircle,
  HiMiniXMark,
} from "react-icons/hi2";

type ToastVariant = "success" | "error" | "info";

interface ToastInput {
  title:        string;
  description?: string;
  variant?:     ToastVariant;
  duration?:    number;
}

interface ToastRecord extends ToastInput {
  id:      string;
  variant: ToastVariant;
}

interface ConfirmOptions {
  title:          string;
  description?:   string;
  confirmLabel?:  string;
  cancelLabel?:   string;
  tone?:          "default" | "danger";
}

interface FeedbackContextValue {
  toast(input: ToastInput): void;
  success(title: string, description?: string): void;
  error(title: string, description?: string): void;
  info(title: string, description?: string): void;
  confirm(options: ConfirmOptions): Promise<boolean>;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

function toastStyles(variant: ToastVariant) {
  switch (variant) {
    case "success":
      return {
        frame: "border-emerald-200 bg-white shadow-lg",
        icon:  "bg-emerald-50 text-emerald-600",
      };
    case "error":
      return {
        frame: "border-rose-200 bg-white shadow-lg",
        icon:  "bg-rose-50 text-rose-600",
      };
    default:
      return {
        frame: "border-border bg-white shadow-lg",
        icon:  "bg-muted text-muted-foreground",
      };
  }
}

function ToastIcon({ variant }: { variant: ToastVariant }) {
  if (variant === "success") return <HiCheckCircle className="h-4 w-4" />;
  if (variant === "error")   return <HiExclamationTriangle className="h-4 w-4" />;
  return <HiInformationCircle className="h-4 w-4" />;
}

export function SystemFeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts]           = useState<ToastRecord[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmOptions | null>(null);
  const confirmResolverRef = useRef<((value: boolean) => void) | null>(null);
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const removeToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = "info", duration = 4000 }: ToastInput) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((current) => [...current, { id, title, description, variant, duration }]);
      const timer = setTimeout(() => removeToast(id), duration);
      timersRef.current.set(id, timer);
    },
    [removeToast]
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
      confirmResolverRef.current?.(false);
    };
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      confirmResolverRef.current = resolve;
      setConfirmState(options);
    });
  }, []);

  const closeConfirm = useCallback((accepted: boolean) => {
    confirmResolverRef.current?.(accepted);
    confirmResolverRef.current = null;
    setConfirmState(null);
  }, []);

  const value = useMemo<FeedbackContextValue>(
    () => ({
      toast,
      success: (title, description) => toast({ title, description, variant: "success" }),
      error:   (title, description) => toast({ title, description, variant: "error" }),
      info:    (title, description) => toast({ title, description, variant: "info" }),
      confirm,
    }),
    [confirm, toast]
  );

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      {/* Toast stack */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[80] flex justify-center px-4 pt-4 sm:justify-end sm:px-6">
        <div className="flex w-full max-w-sm flex-col gap-2">
          {toasts.map((item) => {
            const styles = toastStyles(item.variant);
            return (
              <div
                key={item.id}
                className={`pointer-events-auto overflow-hidden rounded-lg border px-4 py-3 ${styles.frame}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${styles.icon}`}>
                    <ToastIcon variant={item.variant} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    {item.description && (
                      <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeToast(item.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    aria-label="Dismiss"
                  >
                    <HiMiniXMark className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirm dialog */}
      {confirmState && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-4">
          <button
            type="button"
            aria-label="Close"
            onClick={() => closeConfirm(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <div className="relative z-10 flex w-full max-h-[92vh] flex-col rounded-t-lg border border-border bg-background shadow-xl sm:max-w-md sm:rounded-lg">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                    confirmState.tone === "danger"
                      ? "bg-rose-50 text-rose-600"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <HiExclamationTriangle className="h-4 w-4" />
                </div>
                <h2 className="text-base font-semibold text-foreground">{confirmState.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => closeConfirm(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <HiMiniXMark className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            {confirmState.description && (
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <p className="text-sm leading-relaxed text-muted-foreground">{confirmState.description}</p>
              </div>
            )}

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-6 py-4">
              <button
                type="button"
                onClick={() => closeConfirm(false)}
                className="rounded-md border border-input px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                {confirmState.cancelLabel ?? "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => closeConfirm(true)}
                className={`rounded-md px-4 py-2 text-sm font-medium text-white transition-colors ${
                  confirmState.tone === "danger"
                    ? "bg-destructive hover:bg-destructive/90"
                    : "bg-primary hover:bg-primary/90"
                }`}
              >
                {confirmState.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}

export function useToast() {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error("useToast must be used within SystemFeedbackProvider");
  return {
    toast:   context.toast,
    success: context.success,
    error:   context.error,
    info:    context.info,
  };
}

export function useConfirm() {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error("useConfirm must be used within SystemFeedbackProvider");
  return context.confirm;
}
