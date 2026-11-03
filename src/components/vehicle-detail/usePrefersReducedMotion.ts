"use client";

import { useEffect, useState } from "react";

/**
 * Hidratación-safe: el estado inicial ya lee `matchMedia` sincrónicamente en el
 * lazy initializer, así que el primer paint cliente ya refleja la preferencia real
 * (sin flash de movimiento). El efecto solo se suscribe a cambios en vivo del
 * media query (el usuario puede cambiar la preferencia del sistema mientras la
 * página está abierta).
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return reduced;
}
