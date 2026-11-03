"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DUR, EASE } from "@/lib/motion-tokens";
import type { Vehicle } from "@/data/vehicles";

/* ═══════════════════════════════════════════════
   TRUCK PDF MODAL — documento editorial
   backdrop opacity puro sin blur, panel sin rounded,
   filas de índice numeradas con flecha de descarga, cierre "+",
   mobile sheet desde abajo.
   ═══════════════════════════════════════════════ */
const pad = (n: number) => String(n).padStart(2, "0");

export function TruckPdfModal({
  pdfs,
  isOpen,
  onClose,
}: {
  pdfs: NonNullable<Vehicle["truckPdfs"]>;
  isOpen: boolean;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Ref para restaurar el foco al trigger al cerrar (patrón Navbar.tsx).
  const triggerRef = useRef<Element | null>(null);

  // Scroll-lock del body con restauración de scrollY al cerrar (patrón Navbar.tsx).
  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    const body = document.body;
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    return () => {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // Foco atrapado dentro del panel + Escape para cerrar + restaurar foco al trigger (patrón Navbar.tsx).
  useEffect(() => {
    if (!isOpen) return;
    triggerRef.current = document.activeElement;
    const panel = panelRef.current;
    if (!panel) return;
    const focusables = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;
      const els = focusables();
      if (els.length === 0) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (triggerRef.current instanceof HTMLElement) triggerRef.current.focus();
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            aria-hidden
            data-chrome
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.element, ease: EASE.secondary }}
            className="fixed inset-0 z-50 bg-black/85"
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: DUR.element, ease: EASE.secondary }}
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-6"
          >
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="truck-pdf-title"
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-lg max-h-[85vh] sm:max-h-[80vh] overflow-y-auto bg-mb-black text-white border-t sm:border border-white/10"
            >
              <div className="flex items-start justify-between px-6 py-6 md:px-8 md:py-8 border-b border-white/[0.08]">
                <div>
                  <p data-chrome className="text-eyebrow font-mono uppercase tracking-[0.3em] text-silver-500 mb-2">
                    Fichas técnicas
                  </p>
                  <h3 id="truck-pdf-title" data-chrome className="text-h3 font-light tracking-tight">
                    Elegí tu modelo
                  </h3>
                </div>
                <button
                  data-chrome
                  aria-label="Cerrar"
                  onClick={onClose}
                  className="shrink-0 font-mono text-2xl leading-none text-silver-500 hover:text-white transition-colors duration-[var(--dur-micro)] ease-[var(--ease-micro)]"
                >
                  +
                </button>
              </div>
              <div>
                {pdfs.map((pdf, i) => (
                  <a
                    key={i}
                    href={pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-5 px-6 py-5 md:px-8 border-b border-white/[0.06] last:border-0 hover:bg-white/[0.03] transition-colors duration-[var(--dur-micro)] ease-[var(--ease-micro)]"
                  >
                    <span data-chrome className="font-mono text-sm tabular-nums tracking-[0.15em] text-silver-500 shrink-0">
                      {pad(i + 1)}
                    </span>
                    <span className="flex-1 text-base font-light leading-snug">{pdf.name}</span>
                    <svg
                      data-chrome
                      aria-hidden
                      className="w-4 h-4 shrink-0 text-silver-500 group-hover:text-white group-hover:translate-y-0.5 transition-all duration-[var(--dur-micro)] ease-[var(--ease-micro)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
