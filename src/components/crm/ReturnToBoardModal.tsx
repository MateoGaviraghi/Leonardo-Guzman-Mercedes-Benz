"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  Loader2,
  Undo2,
  X,
  ArrowRight,
} from "lucide-react";
import type { CardColumn, CardZone, CrmCard } from "@/types/crm";
import { BOARD_COLUMNS } from "@/types/crm";
import { COLUMN_COLORS, COLUMN_LABELS } from "@/lib/crm/constants";
import { apiMoveCard } from "@/lib/crm/client-api";
import { useToast } from "./Toast";

type Props = {
  /** null = modal cerrado */
  card: CrmCard | null;
  /** zona desde la que se está regresando ('agenda' | 'ventas') */
  originZone: CardZone;
  onClose: () => void;
};

/**
 * Modal accesible para devolver una tarjeta al pizarrón principal.
 *
 * Flow:
 *   - Desde Agenda/Ventas, el user toca "Regresar al pizarrón" en una card
 *   - Se abre este modal con:
 *     · radio group de las 4 columnas del pizarrón
 *     · preselección inteligente (Agenda → Contacto, Ventas → Cierre)
 *     · motivo opcional que queda en el historial
 *   - Submit → POST /api/crm/cards/:id/move → toast → refresh → modal cierra
 */
export function ReturnToBoardModal({ card, originZone, onClose }: Props) {
  const isOpen = !!card;
  const router = useRouter();
  const toast = useToast();

  const defaultColumn: CardColumn = useMemo(
    () => (originZone === "ventas" ? "seguimiento" : "contacto"),
    [originZone]
  );

  const [selected, setSelected] = useState<CardColumn>(defaultColumn);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  // Reset al abrir con una nueva card
  useEffect(() => {
    if (card) {
      setSelected(defaultColumn);
      setReason("");
      setSaving(false);
    }
  }, [card, defaultColumn]);

  // Cerrar con Escape + bloquear scroll del body
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

  const handleSubmit = useCallback(async () => {
    if (!card) return;
    setSaving(true);
    try {
      await apiMoveCard(card.id, {
        to_column: selected,
        to_zone: "pizarron",
        reason:
          reason.trim() ||
          `Regresado al pizarrón desde ${
            originZone === "ventas" ? "Ventas" : "Agenda"
          }`,
      });
      toast.success(
        `${card.client_name} volvió al pizarrón`,
        `Ahora está en ${COLUMN_LABELS[selected]}`
      );
      router.refresh();
      onClose();
    } catch (err) {
      toast.error(
        "No se pudo mover la tarjeta",
        err instanceof Error ? err.message : "Intentá de nuevo"
      );
    } finally {
      setSaving(false);
    }
  }, [card, selected, reason, originZone, onClose, router, toast]);

  return (
    <AnimatePresence>
      {isOpen && card && (
        <>
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Cerrar"
            onClick={() => !saving && onClose()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm"
          />

          {/* Modal container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="return-modal-title"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="pointer-events-auto w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <header className="flex items-start justify-between gap-3 px-6 pt-6 pb-4">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="flex items-center justify-center w-11 h-11 rounded-full bg-slate-900 text-white flex-shrink-0">
                    <Undo2 className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h2
                      id="return-modal-title"
                      className="text-xl font-bold text-slate-900"
                    >
                      Regresar al pizarrón
                    </h2>
                    <p className="text-sm text-slate-600 mt-0.5 truncate">
                      Cliente:{" "}
                      <strong className="text-slate-900">
                        {card.client_name}
                      </strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  aria-label="Cerrar"
                  title="Cerrar (Esc)"
                  className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </header>

              {/* Body */}
              <div className="px-6 pb-5 space-y-5">
                <fieldset>
                  <legend className="text-base font-semibold text-slate-800 mb-3">
                    ¿A qué columna lo querés mover?
                  </legend>
                  <div role="radiogroup" className="space-y-2">
                    {BOARD_COLUMNS.map((col) => (
                      <ColumnRadio
                        key={col}
                        column={col}
                        checked={selected === col}
                        onSelect={() => setSelected(col)}
                      />
                    ))}
                  </div>
                </fieldset>

                <div>
                  <label
                    htmlFor="return-reason"
                    className="block text-base font-semibold text-slate-800 mb-2"
                  >
                    Motivo{" "}
                    <span className="text-slate-500 font-normal">
                      (opcional)
                    </span>
                  </label>
                  <textarea
                    id="return-reason"
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ej: El cliente volvió a consultar por el GLC..."
                    className="w-full px-3 py-3 text-base bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-200 transition-colors resize-none"
                  />
                  <p className="text-xs text-slate-500 mt-1.5">
                    Este texto se guarda en el historial de la tarjeta.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <footer className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-3 min-h-[48px] text-base font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-3 min-h-[48px] text-base font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 active:bg-slate-950 transition-colors disabled:opacity-50 disabled:cursor-wait focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Moviendo...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Mover a {COLUMN_LABELS[selected]}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </footer>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------

function ColumnRadio({
  column,
  checked,
  onSelect,
}: {
  column: CardColumn;
  checked: boolean;
  onSelect: () => void;
}) {
  const colors = COLUMN_COLORS[column];

  return (
    <label
      className={[
        "flex items-center gap-3 px-4 py-3 min-h-[56px] rounded-lg border-2 cursor-pointer transition-all",
        checked
          ? "border-slate-900 bg-slate-50 shadow-sm"
          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50",
      ].join(" ")}
    >
      <input
        type="radio"
        name="return-target-column"
        value={column}
        checked={checked}
        onChange={onSelect}
        className="sr-only"
      />
      {/* Dot radio indicator */}
      <span
        aria-hidden="true"
        className={[
          "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
          checked
            ? "border-slate-900 bg-slate-900"
            : "border-slate-300 bg-white",
        ].join(" ")}
      >
        {checked && <span className="w-2 h-2 rounded-full bg-white" />}
      </span>
      {/* Color de la columna */}
      <span
        aria-hidden="true"
        className={["w-2.5 h-2.5 rounded-full flex-shrink-0", colors.accent].join(
          " "
        )}
      />
      {/* Label */}
      <span className="text-base font-semibold text-slate-900 flex-1">
        {COLUMN_LABELS[column]}
      </span>
    </label>
  );
}
