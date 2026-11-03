"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE, EXIT } from "@/lib/motion-tokens";

/**
 * Back-to-top — restyle DS (mb-black/silver, sin verde, sin rounded-full).
 * Apilado ARRIBA del chip de WhatsApp (fixed, h-14=56px, mismo right offset)
 * para que nunca se superpongan: bottom = offset base + 68px + safe-area.
 * WhatsAppChip.tsx NO se toca (fuera de scope).
 */
export function BackToTop({ isAMG }: { isAMG: boolean }) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Detectar scroll para mostrar/ocultar botón de ir arriba
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: EXIT.element, ease: EASE.secondary }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={`group fixed right-[clamp(16px,4vw,32px)] bottom-[calc(clamp(16px,4vw,32px)+68px+env(safe-area-inset-bottom))] z-40 flex h-12 w-12 items-center justify-center rounded-md border transition-colors duration-[var(--dur-element)] ease-[var(--ease-secondary)] md:h-14 md:w-14 ${
            isAMG
              ? "border-amg-teal/40 bg-neutral-900/90 hover:bg-neutral-800 hover:border-amg-teal/70"
              : "border-silver-700/60 bg-mb-black hover:border-silver-500 hover:bg-black"
          }`}
          aria-label="Volver arriba"
        >
          <svg
            className={`h-5 w-5 transition-transform duration-[var(--dur-micro)] ease-[var(--ease-micro)] group-hover:-translate-y-1 md:h-6 md:w-6 ${
              isAMG ? "text-amg-teal" : "text-white"
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
