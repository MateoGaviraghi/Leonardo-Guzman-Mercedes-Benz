"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastKind = "success" | "error" | "info";
type Toast = {
  id: string;
  kind: ToastKind;
  title: string;
  description?: string;
};

type ToastContextValue = {
  show: (toast: Omit<Toast, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const VISIBLE_MS = 4200;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback<ToastContextValue["show"]>(
    (t) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { ...t, id }]);
      setTimeout(() => remove(id), VISIBLE_MS);
    },
    [remove]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (title, description) =>
        show({ kind: "success", title, description }),
      error: (title, description) =>
        show({ kind: "error", title, description }),
      info: (title, description) => show({ kind: "info", title, description }),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={remove} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ---------------------------------------------------------------------------

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const { kind, title, description } = toast;

  const styles: Record<ToastKind, { bg: string; border: string; icon: ReactNode }> = {
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-300",
      icon: (
        <CheckCircle2
          className="w-5 h-5 text-emerald-600 flex-shrink-0"
          aria-hidden="true"
        />
      ),
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-300",
      icon: (
        <AlertCircle
          className="w-5 h-5 text-red-600 flex-shrink-0"
          aria-hidden="true"
        />
      ),
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-300",
      icon: (
        <Info
          className="w-5 h-5 text-blue-600 flex-shrink-0"
          aria-hidden="true"
        />
      ),
    },
  };

  const s = styles[kind];

  return (
    <motion.div
      role={kind === "error" ? "alert" : "status"}
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className={[
        "pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg border-2 shadow-lg bg-white",
        s.bg,
        s.border,
      ].join(" ")}
    >
      {s.icon}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900">{title}</p>
        {description && (
          <p className="text-sm text-slate-700 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar notificación"
        className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </motion.div>
  );
}
