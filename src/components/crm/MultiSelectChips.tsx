"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Plus, X, Check, Search } from "lucide-react";

type Option = { id: string; name: string };

type Props = {
  label: string;
  placeholder: string;
  options: Option[];
  value: string[]; // ids seleccionados
  onChange: (next: string[]) => void;
  helpText?: string;
};

/**
 * Multi-select accesible con chips descartables + dropdown buscable.
 * Pensado para usuarios no-tech: siempre muestra la lista entera, los tildes
 * son grandes y el "quitar" de cada chip es un botón claro.
 */
export function MultiSelectChips({
  label,
  placeholder,
  options,
  value,
  onChange,
  helpText,
}: Props) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar al click afuera
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = useMemo(
    () => options.filter((o) => value.includes(o.id)),
    [options, value]
  );

  const visibleOptions = useMemo(() => {
    const q = filter.toLowerCase().trim();
    if (!q) return options;
    return options.filter((o) => o.name.toLowerCase().includes(q));
  }, [options, filter]);

  const toggle = (id: string) => {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
    // Cerrar el dropdown al seleccionar — si querés agregar más, "+ Agregar" lo reabre
    setOpen(false);
    setFilter("");
  };

  const remove = (id: string) => onChange(value.filter((v) => v !== id));

  return (
    <div ref={ref} className="relative">
      <label className="block text-base font-semibold text-slate-800 mb-2">
        {label}
      </label>

      <div
        className={[
          "min-h-[48px] w-full flex flex-wrap items-center gap-2 px-2 py-1.5 bg-white border rounded-lg transition-colors",
          open
            ? "border-slate-800 ring-2 ring-slate-200"
            : "border-slate-300 hover:border-slate-400",
        ].join(" ")}
      >
        {selected.length === 0 ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex-1 inline-flex items-center justify-between gap-2 px-2 py-2 min-h-[40px] text-base text-slate-500 rounded hover:bg-slate-50 transition-colors"
          >
            <span>{placeholder}</span>
            <ChevronDown
              className={[
                "w-4 h-4 text-slate-400 transition-transform",
                open && "rotate-180",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-hidden="true"
            />
          </button>
        ) : (
          <>
            {selected.map((opt) => (
              <span
                key={opt.id}
                className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1.5 bg-slate-900 text-white text-sm font-medium rounded-full"
              >
                {opt.name}
                <button
                  type="button"
                  onClick={() => remove(opt.id)}
                  aria-label={`Quitar ${opt.name}`}
                  title={`Quitar ${opt.name}`}
                  className="p-0.5 rounded-full hover:bg-slate-700 active:bg-slate-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={`Agregar más opciones a ${label}`}
              title="Agregar más"
              className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[36px] text-sm font-semibold text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              Agregar
            </button>
          </>
        )}
      </div>

      {helpText && (
        <p className="text-xs text-slate-500 mt-1.5">{helpText}</p>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 left-0 right-0 bg-white border-2 border-slate-200 rounded-lg shadow-xl overflow-hidden">
          {options.length > 6 && (
            <div className="relative border-b border-slate-200 p-2">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                autoFocus
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-9 pr-3 py-2 text-base bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          )}
          <div
            role="listbox"
            aria-multiselectable="true"
            className="max-h-64 overflow-y-auto custom-scrollbar"
          >
            {visibleOptions.length === 0 ? (
              <p className="px-4 py-6 text-sm text-center text-slate-500">
                No hay opciones que coincidan
              </p>
            ) : (
              visibleOptions.map((opt) => {
                const checked = value.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="option"
                    aria-selected={checked}
                    onClick={() => toggle(opt.id)}
                    className={[
                      "w-full flex items-center justify-between gap-2 px-4 py-3 text-base text-left hover:bg-slate-50 active:bg-slate-100 transition-colors min-h-[44px]",
                      checked && "bg-slate-50 font-semibold text-slate-900",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <span>{opt.name}</span>
                    {checked && (
                      <Check
                        className="w-5 h-5 text-emerald-600 flex-shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
