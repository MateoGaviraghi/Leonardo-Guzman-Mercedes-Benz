"use client";

import { useEffect, useState } from "react";

/**
 * Guard táctil: true solo si el dispositivo tiene hover real Y puntero fino
 * (mouse/trackpad). Evita aplicar comportamientos hover-only (cursor "ARRASTRÁ",
 * dim de FocusCards, etc.) en touch. SSR-safe: default false.
 */
export function usePointerFine(): boolean {
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(hover: hover) and (pointer: fine)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFine(mql.matches);
    const handler = (e: MediaQueryListEvent) => setFine(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return fine;
}
