"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, useScroll } from "framer-motion";

const emptySubscribe = () => () => {};

/**
 * Barra fina de 2px que indica el progress de scroll de la página.
 * Color mb-blue (#00adef).
 *
 * Vive SOLO en /experiencia (chrome-global §2.8): progress = motion
 * externamente conducido (linear, sin spring — gramática correcta),
 * y solo donde el scroll es narrativa larga.
 *
 * - Mapeo directo scroll→scaleX (linear; springs prohibidos por dirección)
 * - Hide automático en `prefers-reduced-motion: reduce`
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  if (!mounted) return null;

  return createPortal(
    <motion.div
      aria-hidden
      className="fixed top-0 left-0 right-0 h-[2px] bg-mb-blue origin-left z-[70] pointer-events-none motion-reduce:hidden"
      style={{ scaleX: scrollYProgress }}
    />,
    document.body,
  );
}
