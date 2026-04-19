"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, CheckCircle, Loader2, SkipForward, X } from "lucide-react";
import type { CardColumn, CrmCard } from "@/types/crm";
import { COLUMN_LABELS } from "@/lib/crm/constants";
import { todayIsoDate } from "@/lib/crm/date-logic";
import { useToast } from "./Toast";
import { useRouter } from "next/navigation";

/**
 * Sugerencia por columna (en días desde hoy).
 * Refleja el tiempo típico que toma completar esa etapa antes del siguiente
 * contacto. Si cambiás el proceso, acá.
 */
const SUGGESTION_DAYS: Record<CardColumn, number> = {
  contacto: 1, // si volvió a contacto, reintentar mañana
  llamada_visita: 2, // agendar llamada/visita en 2 días
  cotizar: 3, // cotización lista en ~3 días hábiles
  seguimiento: 7, // follow-up a la semana
  agenda: 14,
  ventas: 0,
};

const PRESETS: Array<{ label: string; days: number }> = [
  { label: "Hoy", days: 0 },
  { label: "Mañana", days: 1 },
  { label: "En 3 días", days: 3 },
  { label: "En 1 semana", days: 7 },
  { label: "En 2 semanas", days: 14 },
];

type Props = {
  card: CrmCard | null;
  targetColumn: CardColumn | null;
  onClose: () => void;
};

export function NextContactPrompt({ card, targetColumn, onClose }: Props) {
  const isOpen = !!card && !!targetColumn;
  const router = useRouter();
  const toast = useToast();

  const suggested = useMemo(() => {
    if (!targetColumn) return todayIsoDate();
    const days = SUGGESTION_DAYS[targetColumn] ?? 3;
    const d = new Date(todayIsoDate());
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }, [targetColumn]);

  const [date, setDate] = useState(suggested);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDate(suggested);
      setSaving(false);
    }
  }, [isOpen, suggested]);

  // Escape para saltar
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    document.addEventListener("keydown", handler);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = prev;
    };
  }, [isOpen, saving, onClose]);

  const applyPreset = (days: number) => {
    const d = new Date(todayIsoDate());
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().slice(0, 10));
  };

  const handleConfirm = async () => {
    if (!card || !date) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/crm/cards/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ next_contact_at: date }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      toast.success(
        "Fecha actualizada",
        `Próximo contacto con ${card.client_name}: ${formatDMY(date)}`
      );
      router.refresh();
      onClose();
    } catch (err) {
      toast.error(
        "No se pudo actualizar la fecha",
        err instanceof Error ? err.message : "Intentá de nuevo"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    if (saving) return;
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && card && targetColumn && (
        <>
          <motion.button
            type="button"
            aria-label="Saltar"
            onClick={handleSkip}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="next-prompt-title"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="pointer-events-auto w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden"
            >
              <header className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 text-white flex-shrink-0">
                    <Calendar className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h2
                      id="next-prompt-title"
                      className="text-lg font-bold text-slate-900 leading-tight"
                    >
                      ¿Cuándo es el próximo contacto?
                    </h2>
                    <p className="text-sm text-slate-600 mt-0.5 truncate">
                      <strong>{card.client_name}</strong> pasó a{" "}
                      <strong className="text-slate-900">
                        {COLUMN_LABELS[targetColumn]}
                      </strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={saving}
                  aria-label="Saltar"
                  title="Saltar (Esc)"
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </header>

              <div className="px-5 pb-4 space-y-3">
                <p className="text-xs text-slate-500">
                  Para {COLUMN_LABELS[targetColumn].toLowerCase()}, sugerimos
                  hacer el próximo contacto en{" "}
                  <strong className="text-slate-800">
                    {SUGGESTION_DAYS[targetColumn]} día
                    {SUGGESTION_DAYS[targetColumn] === 1 ? "" : "s"}
                  </strong>
                  .
                </p>

                {/* Presets rápidos */}
                <div className="flex flex-wrap gap-1.5">
                  {PRESETS.map((p) => {
                    const presetDate = (() => {
                      const d = new Date(todayIsoDate());
                      d.setDate(d.getDate() + p.days);
                      return d.toISOString().slice(0, 10);
                    })();
                    const isActive = presetDate === date;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => applyPreset(p.days)}
                        disabled={saving}
                        className={[
                          "inline-flex items-center px-3 py-1.5 min-h-[36px] text-sm font-semibold rounded-full border transition-colors",
                          isActive
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>

                {/* Date picker preciso */}
                <div>
                  <label
                    htmlFor="next-contact-date"
                    className="block text-sm font-semibold text-slate-800 mb-1.5"
                  >
                    O elegí una fecha exacta:
                  </label>
                  <input
                    id="next-contact-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={todayIsoDate()}
                    className="w-full px-3 py-2.5 min-h-[44px] text-base bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-200 transition-colors"
                  />
                </div>
              </div>

              <footer className="flex items-center justify-end gap-2 px-5 py-3 bg-slate-50 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 min-h-[44px] text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  <SkipForward className="w-4 h-4" aria-hidden="true" />
                  Saltar
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={saving || !date}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 active:bg-slate-950 transition-colors disabled:opacity-50 disabled:cursor-wait"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" aria-hidden="true" />
                  )}
                  Confirmar fecha
                </button>
              </footer>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function formatDMY(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
