"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function GlobalSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const [value, setValue] = useState(initial);
  const [isMac, setIsMac] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detectar Mac para mostrar el símbolo correcto del atajo
  useEffect(() => {
    setIsMac(
      typeof navigator !== "undefined" &&
        /Mac|iPhone|iPad/i.test(navigator.platform)
    );
  }, []);

  // Sincronizar con cambios externos de la URL
  useEffect(() => {
    setValue(searchParams.get("q") ?? "");
  }, [searchParams]);

  // Debounce 250ms — actualiza ?q= sin recargar la página
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Atajo global: Ctrl+K / Cmd+K enfoca el buscador
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isK = e.key === "k" || e.key === "K";
      if (isK && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const clear = () => {
    setValue("");
    inputRef.current?.focus();
  };

  const shortcutLabel = isMac ? "⌘K" : "Ctrl K";

  return (
    <div className="relative">
      <label htmlFor="crm-search" className="sr-only">
        Buscar cliente
      </label>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
        aria-hidden="true"
      />
      <input
        id="crm-search"
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar por nombre, teléfono o producto..."
        className="w-full pl-11 pr-20 py-3 min-h-[44px] text-base bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-200 transition-colors shadow-sm"
        autoComplete="off"
      />

      {/* Indicador de atajo (visible cuando el input está vacío) */}
      {!value && (
        <kbd
          aria-hidden="true"
          title="Atajo para enfocar el buscador"
          className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-0.5 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded select-none pointer-events-none"
        >
          {shortcutLabel}
        </kbd>
      )}

      {/* Botón de limpiar (cuando hay texto) */}
      {value && (
        <button
          type="button"
          onClick={clear}
          aria-label="Limpiar búsqueda"
          title="Limpiar búsqueda"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
