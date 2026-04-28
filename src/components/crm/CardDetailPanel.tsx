"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2, UserPlus, Pencil, ClipboardList } from "lucide-react";
import type {
  CardColumn,
  CrmCard,
  CrmInterest,
  CrmProduct,
} from "@/types/crm";
import { CardForm } from "./CardForm";
import { CardHistory } from "./CardHistory";

type Props = {
  zonaId: string;
  products: CrmProduct[];
  interests: CrmInterest[];
};

type Tab = "datos" | "historial";

/**
 * Drawer lateral de detalle de tarjeta.
 * Se abre cuando la URL tiene ?card=<id|nuevo>.
 * - ?card=nuevo → modo creación (opcional: &col=<column> para preseleccionar)
 * - ?card=<uuid> → modo edición: fetchea la tarjeta y muestra tabs Datos/Historial
 *
 * Cierre: botón X, tecla Escape o click en el backdrop.
 */
export function CardDetailPanel({ zonaId, products, interests }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const cardParam = searchParams.get("card");
  const colParam = searchParams.get("col") as CardColumn | null;

  const isOpen = !!cardParam;
  const isCreating = cardParam === "nuevo";
  const cardId = !isCreating ? cardParam : null;

  const [card, setCard] = useState<CrmCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("datos");

  const close = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("card");
    params.delete("col");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [router, pathname, searchParams]);

  // Reset al cambiar de tarjeta + fetch del nuevo dato.
  // Patrón "reset+fetch on key change" — la regla react-hooks/set-state-in-effect
  // marca falso positivo acá, ya que el reset acompaña a una sincronización con
  // recurso externo (la API). Suprimir es seguro y preferible a un refactor mayor.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTab("datos");
    setCard(null);
    setLoadError(null);
    if (!cardId) return;

    let cancelled = false;
    setLoading(true);
    fetch(`/api/crm/cards/${cardId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.success && data.card) {
          setCard(data.card);
        } else {
          setLoadError(data?.error ?? "No se pudo cargar la tarjeta");
        }
      })
      .catch((e) => {
        if (cancelled) return;
        setLoadError(e instanceof Error ? e.message : "Error desconocido");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cardId]);

  // Escape para cerrar
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  // Prevenir scroll del body mientras está abierto
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Cerrar detalle"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px]"
          />

          {/* Drawer */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="crm-drawer-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:max-w-xl lg:max-w-2xl bg-white shadow-2xl flex flex-col"
          >
            {/* Header del drawer */}
            <header className="flex items-start justify-between gap-3 px-5 md:px-6 py-4 border-b border-slate-200">
              <div className="flex items-start gap-3 min-w-0">
                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex-shrink-0">
                  {isCreating ? (
                    <UserPlus className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <Pencil className="w-5 h-5" aria-hidden="true" />
                  )}
                </span>
                <div className="min-w-0">
                  <h2
                    id="crm-drawer-title"
                    className="text-xl font-bold text-slate-900 truncate"
                  >
                    {isCreating
                      ? "Nuevo cliente"
                      : card
                      ? card.client_name
                      : "Cargando..."}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {isCreating
                      ? "Completá los datos del cliente"
                      : "Editá los datos o revisá el historial"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={close}
                aria-label="Cerrar"
                title="Cerrar (Esc)"
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </header>

            {/* Tabs (solo en modo edición) */}
            {!isCreating && (
              <div className="px-5 md:px-6 pt-3 border-b border-slate-200">
                <div
                  role="tablist"
                  aria-label="Secciones del detalle"
                  className="flex gap-1"
                >
                  <TabButton
                    active={tab === "datos"}
                    onClick={() => setTab("datos")}
                    icon={<Pencil className="w-4 h-4" aria-hidden="true" />}
                    label="Datos"
                  />
                  <TabButton
                    active={tab === "historial"}
                    onClick={() => setTab("historial")}
                    icon={
                      <ClipboardList className="w-4 h-4" aria-hidden="true" />
                    }
                    label="Historial"
                  />
                </div>
              </div>
            )}

            {/* Contenido */}
            <div className="flex-1 flex flex-col min-h-0">
              {loading && !isCreating && (
                <div className="flex items-center justify-center gap-2 py-20 text-slate-500">
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  <span>Cargando tarjeta...</span>
                </div>
              )}

              {loadError && (
                <div className="m-6 p-4 bg-red-50 border border-red-300 rounded-lg text-red-900">
                  <p className="font-semibold">No se pudo cargar la tarjeta</p>
                  <p className="text-sm mt-1">{loadError}</p>
                </div>
              )}

              {!loading && !loadError && (
                <>
                  {isCreating && (
                    <CardForm
                      mode="create"
                      zonaId={zonaId}
                      initialColumn={colParam ?? "contacto"}
                      products={products}
                      interests={interests}
                      onSaved={close}
                      onClosed={close}
                    />
                  )}
                  {!isCreating && card && tab === "datos" && (
                    <CardForm
                      mode="edit"
                      zonaId={zonaId}
                      card={card}
                      products={products}
                      interests={interests}
                      onSaved={close}
                      onClosed={close}
                    />
                  )}
                  {!isCreating && card && tab === "historial" && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-5 md:px-6 py-5">
                      <CardHistory cardId={card.id} />
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 px-4 py-3 min-h-[44px] text-sm font-semibold rounded-t-lg border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1",
        active
          ? "text-slate-900 border-slate-900"
          : "text-slate-500 border-transparent hover:text-slate-900 hover:border-slate-300",
      ].join(" ")}
    >
      {icon}
      {label}
    </button>
  );
}
