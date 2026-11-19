"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Formato de cada foto del auto que se está mostrando, armado en el build por
 * `scripts/lista-fotos.mjs` (`src/data/formatos-fotos.json`). La clave es la ruta
 * sin extensión relativa a `/vehicles/<id>/` («exterior/1», «hero/hero-mobile»).
 * El servidor pasa solo las fotos de ese auto, no la lista entera.
 */
type Formatos = { base: string; mapa: Record<string, string> };

const FormatosContext = createContext<Formatos | null>(null);

export function FormatosFotos({
  vehicleId,
  formatos,
  children,
}: {
  vehicleId: string;
  formatos?: Record<string, string>;
  children: ReactNode;
}) {
  return (
    <FormatosContext.Provider
      value={formatos ? { base: `/vehicles/${vehicleId}/`, mapa: formatos } : null}
    >
      {children}
    </FormatosContext.Provider>
  );
}

/**
 * Formato de la foto en `basePath` (ruta sin extensión):
 * - `"jpg"`, `"avif"`… → existe en ese formato;
 * - `null` → la lista de este auto existe y la foto no está: no hay archivo
 *   (por ejemplo `hero-mobile` en camiones), no se pide nada;
 * - `undefined` → no hay lista para este auto o la ruta es de otra carpeta:
 *   se prueban los formatos como antes.
 * Una foto agregada con `next dev` corriendo aparece al reiniciarlo (el script
 * corre al arrancar).
 */
export function useFormatoFoto(basePath: string): string | null | undefined {
  return useFormatoDe()(basePath);
}

/**
 * Lo mismo que `useFormatoFoto`, pero devuelve la función: para componentes que
 * arman varias rutas en un `map` (no se puede llamar un hook por foto).
 */
export function useFormatoDe(): (basePath: string) => string | null | undefined {
  const ctx = useContext(FormatosContext);
  return (basePath) => {
    if (!ctx || !basePath.startsWith(ctx.base)) return undefined;
    return ctx.mapa[basePath.slice(ctx.base.length)] ?? null;
  };
}
