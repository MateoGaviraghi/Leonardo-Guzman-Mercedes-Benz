"use client";

import { motion, MotionConfig } from "framer-motion";
import { EASE, PAGE_TRANSITION } from "@/lib/motion-tokens";

/**
 * Page transition (chrome-global §2.6): Next App Router re-monta este
 * template en cada navegación. Entrada 300ms, opacity-only — nunca aplica
 * `transform`, así que no crea containing block para `position:fixed`.
 *
 * Contrato con las páginas: los heros arrancan a HERO_DELAY (0.12s), en
 * PARALELO a esta entrada (no en serie) — no esperan a que termine.
 *
 * `MotionConfig reducedMotion="user"` desactiva los transforms para
 * usuarios con prefers-reduced-motion (Framer ignora el override CSS
 * global porque anima con estilos inline).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: PAGE_TRANSITION.in, ease: EASE.primary }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
