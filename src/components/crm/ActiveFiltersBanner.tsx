"use client";

import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  filteredCount: number;
  totalCount: number;
  /** Lista de params que este banner considera como "filtros" y puede limpiar. */
  paramsToClear?: string[];
};

/**
 * Banner que aparece sobre las listas cuando hay filtros activos (?q, ?vencidas).
 * Muestra el conteo actual y ofrece un botón para quitar TODOS los filtros
 * de una sola vez — evita que el usuario tenga que buscar cada uno.
 */
export function ActiveFiltersBanner({
  filteredCount,
  totalCount,
  paramsToClear = ["q", "vencidas"],
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = searchParams.get("q");
  const overdueOnly = searchParams.get("vencidas") === "1";

  if (!query && !overdueOnly) return null;

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    for (const p of paramsToClear) params.delete(p);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div
      role="status"
      className="mb-4 flex items-center justify-between gap-3 bg-slate-100 border border-slate-200 rounded-lg px-4 py-2.5"
    >
      <p className="text-sm text-slate-700 flex-1 min-w-0">
        Mostrando{" "}
        <strong className="text-slate-900 tabular-nums">
          {filteredCount}
        </strong>{" "}
        de{" "}
        <strong className="text-slate-900 tabular-nums">{totalCount}</strong>{" "}
        {totalCount === 1 ? "tarjeta" : "tarjetas"}
        {query && (
          <>
            {" · "}
            <span>
              búsqueda:{" "}
              <strong className="text-slate-900">&ldquo;{query}&rdquo;</strong>
            </span>
          </>
        )}
        {overdueOnly && (
          <>
            {" · "}
            <span>
              filtro:{" "}
              <strong className="text-red-700">solo vencidas</strong>
            </span>
          </>
        )}
      </p>
      <button
        type="button"
        onClick={clearAll}
        title="Quitar todos los filtros y ver todas las tarjetas"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" aria-hidden="true" />
        Limpiar filtros
      </button>
    </div>
  );
}
