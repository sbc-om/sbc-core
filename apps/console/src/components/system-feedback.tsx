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
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastRecord extends ToastInput {
  id: string;
  variant: ToastVariant;
}

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
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
        frame: "border-emerald-200/80 bg-white/95 shadow-[0_24px_64px_-32px_rgba(16,185,129,0.42)]",
        icon: "bg-emerald-50 text-emerald-600",
      };
    case "error":
      return {
        frame: "border-rose-200/80 bg-white/95 shadow-[0_24px_64px_-32px_rgba(244,63,94,0.38)]",
        icon: "bg-rose-50 text-rose-600",
      };
    default:
      return {
        frame: "border-slate-200/80 bg-white/95 shadow-[0_24px_64px_-32px_rgba(15,23,42,0.28)]",
        icon: "bg-slate-100 text-slate-700",
      };
  }
}

function ToastIcon({ variant }: { variant: ToastVariant }) {
  if (variant === "success") {
    return <HiCheckCircle className="h-5 w-5" />;
  }

  if (variant === "error") {
    return <HiExclamationTriangle className="h-5 w-5" />;
  }

  return <HiInformationCircle className="h-5 w-5" />;
}

export function SystemFeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmOptions | null>(null);
  const confirmResolverRef = useRef<((value: boolean) => void) | null>(null);
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const removeToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = "info", duration = 4200 }: ToastInput) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((current) => [...current, { id, title, description, variant, duration }]);

      const timer = setTimeout(() => {
        removeToast(id);
      }, duration);

      timersRef.current.set(id, timer);
    },
    [removeToast]
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
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
      error: (title, description) => toast({ title, description, variant: "error" }),
      info: (title, description) => toast({ title, description, variant: "info" }),
      confirm,
    }),
    [confirm, toast]
  );

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 top-0 z-[80] flex justify-center px-4 pt-4 sm:justify-end sm:px-6">
        <div className="flex w-full max-w-sm flex-col gap-3">
          {toasts.map((item) => {
            const styles = toastStyles(item.variant);

            return (
              <div
                key={item.id}
                className={`pointer-events-auto overflow-hidden rounded-[1.35rem] border px-4 py-4 backdrop-blur ${styles.frame}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${styles.icon}`}>
                    <ToastIcon variant={item.variant} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                    {item.description && (
                      <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeToast(item.id)}
                    className="rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
                    aria-label="Dismiss notification"
                  >
                    <HiMiniXMark className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {confirmState && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            aria-label="Close confirmation"
            onClick={() => closeConfirm(false)}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
          />

          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/60 bg-[linear-gradient(145deg,_rgba(255,255,255,0.96),_rgba(248,250,252,0.96))] p-6 shadow-[0_36px_120px_-40px_rgba(15,23,42,0.45)] sm:p-7">
            <div className="flex items-start gap-4">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] ${confirmState.tone === "danger" ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-700"}`}>
                <HiExclamationTriangle className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Confirmation</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{confirmState.title}</h2>
                {confirmState.description && (
                  <p className="mt-3 text-sm leading-6 text-slate-500">{confirmState.description}</p>
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => closeConfirm(false)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {confirmState.cancelLabel ?? "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => closeConfirm(true)}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold text-white transition ${confirmState.tone === "danger" ? "bg-rose-600 hover:bg-rose-500" : "bg-slate-950 hover:bg-slate-800"}`}
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
  if (!context) {
    throw new Error("useToast must be used within SystemFeedbackProvider");
  }

  return {
    toast: context.toast,
    success: context.success,
    error: context.error,
    info: context.info,
  };
}

export function useConfirm() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useConfirm must be used within SystemFeedbackProvider");
  }

  return context.confirm;
}