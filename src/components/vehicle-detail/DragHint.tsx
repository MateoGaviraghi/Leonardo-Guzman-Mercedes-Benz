"use client";

import { motion } from "framer-motion";
import { DUR, EASE } from "@/lib/motion-tokens";

/**
 * Hint "ARRASTRÁ" efímero DENTRO del stage (reemplaza el cursor-follower DragCursor).
 * Presentacional: el estado (aparecer/desaparecer/no-reaparecer) lo maneja ShowroomCarousel.
 * Los chevrons oscilan +-4px en loop suave; reduced-motion => estaticos, sin translateY de entrada.
 * Chrome puro: aria-hidden + data-chrome (excluido del gate). pointer-events-none (no bloquea drag).
 */
export function DragHint({ visible, reduced }: { visible: boolean; reduced: boolean }) {
  return (
    <div
      aria-hidden
      data-chrome
      className={`pointer-events-none absolute inset-0 z-20 transition-opacity duration-[var(--dur-element)] ease-[var(--ease-secondary)] ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Scrim de solo-legibilidad (sin pill/caja/radius) */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent" />
      {/* Etiqueta anclada abajo (~24px), centrada horizontal */}
      <div
        className={`absolute inset-x-0 bottom-6 flex items-center justify-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-white transition-transform duration-[var(--dur-element)] ease-[var(--ease-secondary)] ${
          visible && !reduced ? "translate-y-0" : reduced ? "translate-y-0" : "translate-y-[6px]"
        }`}
      >
        <motion.span
          animate={reduced ? undefined : { x: [0, -4, 0] }}
          transition={reduced ? undefined : { duration: DUR.hero, ease: EASE.scrub, repeat: Infinity }}
        >
          {"‹"}
        </motion.span>
        <span>Arrastrá</span>
        <motion.span
          animate={reduced ? undefined : { x: [0, 4, 0] }}
          transition={reduced ? undefined : { duration: DUR.hero, ease: EASE.scrub, repeat: Infinity }}
        >
          {"›"}
        </motion.span>
      </div>
    </div>
  );
}
