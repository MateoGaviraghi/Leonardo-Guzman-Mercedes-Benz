"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

/**
 * Loader de /experiencia — negro puro, eyebrow mono, barra rectángulo por
 * scaleX, contador % mono tabular. El % refleja SOLO la precarga del
 * segmento 0 (WU-3 §6.1); seg 1/2 cargan en background sin bloquear.
 *
 * Renderizado vía portal a document.body: el wrapper de transición de
 * página (template.tsx) anima `transform` sobre un contenedor con altura de
 * documento completa, lo que rompe `position: fixed` de este loader al
 * volverlo relativo a ese containing block. El portal evita quedar atrapado
 * ahí y mantiene el loader centrado en el viewport real.
 */
const emptySubscribe = () => () => {};

export default function ExperienciaLoader({ pct }: { pct: number }) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black pointer-events-none">
      <p className="text-eyebrow mb-6 font-mono uppercase tracking-[0.14em] text-silver-300">
        Cargando la gama
      </p>
      <div className="h-px w-40 overflow-hidden bg-white/15">
        <div
          className="h-full w-full origin-left bg-white will-change-transform"
          style={{
            transform: `scaleX(${Math.max(0, Math.min(1, pct / 100))})`,
            transition: reduced ? "none" : "transform 150ms linear",
          }}
        />
      </div>
      <p className="mt-4 font-mono text-xs tabular-nums tracking-[0.14em] text-silver-500">
        {pct}%
      </p>
    </div>,
    document.body
  );
}
