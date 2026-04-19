"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, MapPin, Settings2, Check } from "lucide-react";
import type { CrmZona } from "@/types/crm";

type Props = {
  current: CrmZona;
  zonas: CrmZona[];
};

/**
 * Dropdown "Zona: Sunchales ▾" — cambiar entre zonas geográficas.
 * - Muestra la zona actual
 * - Al click despliega la lista de zonas activas
 * - Incluye un link "Gestionar zonas" al ABM
 * - Preserva la subsección actual al cambiar (pizarron/agenda/ventas)
 */
export function ZonaSelector({ current, zonas }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Cerrar al click afuera o Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Deducir la subsección actual (pizarron / agenda / ventas) para preservarla
  const subsection = (() => {
    const match = pathname.match(/\/crm\/[^/]+\/(pizarron|agenda|ventas)/);
    return match?.[1] ?? "pizarron";
  })();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        title="Cambiar de zona"
        className="inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 min-h-[44px] bg-white border-2 border-slate-300 rounded-lg text-sm sm:text-base font-semibold text-slate-900 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 shadow-sm"
      >
        <MapPin className="w-4 h-4 text-slate-500" aria-hidden="true" />
        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          Zona:
        </span>
        <span className="truncate max-w-[140px]">{current.name}</span>
        <ChevronDown
          className={[
            "w-4 h-4 text-slate-500 transition-transform flex-shrink-0",
            open && "rotate-180",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full mt-2 w-64 bg-white border-2 border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden"
        >
          <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wide bg-slate-50 border-b border-slate-200">
            Cambiar de zona
          </div>
          <ul className="max-h-72 overflow-y-auto custom-scrollbar">
            {zonas.map((z) => {
              const isCurrent = z.id === current.id;
              return (
                <li key={z.id}>
                  <Link
                    role="menuitem"
                    href={`/crm/${z.slug}/${subsection}`}
                    onClick={() => setOpen(false)}
                    className={[
                      "flex items-center justify-between gap-2 px-4 py-3 min-h-[48px] text-base hover:bg-slate-50 active:bg-slate-100 transition-colors",
                      isCurrent && "font-semibold text-slate-900 bg-slate-50",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <span className="truncate">{z.name}</span>
                    {isCurrent && (
                      <Check
                        className="w-4 h-4 text-emerald-600 flex-shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            role="menuitem"
            href="/crm/zonas"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-3 min-h-[44px] text-sm font-semibold text-slate-700 border-t border-slate-200 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors"
          >
            <Settings2 className="w-4 h-4" aria-hidden="true" />
            Gestionar zonas
          </Link>
        </div>
      )}
    </div>
  );
}
