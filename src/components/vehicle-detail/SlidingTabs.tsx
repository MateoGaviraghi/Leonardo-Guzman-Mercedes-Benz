"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { DUR, EASE } from "@/lib/motion-tokens";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import type { AvailableTab } from "./types";

/**
 * Direction Aware Tabs — bloque invertido deslizante, SIN subrayado.
 * Desktop: fila centrada. Mobile: banda horizontal scrolleable (snap), UNA sola fila.
 * El bloque activo usa `layoutId` (transform-only); en reduced-motion salta instantáneo.
 */
export function SlidingTabs({
  tabs,
  activeId,
  onChange,
  scope,
  variant = "dark",
  isAMG = false,
}: {
  tabs: AvailableTab[];
  activeId: string;
  onChange: (id: string) => void;
  /** Identificador único de esta instancia — evita colisión de `layoutId` entre secciones. */
  scope: string;
  /** Superficie sobre la que se monta: define el color del bloque invertido. */
  variant?: "dark" | "light" | "papel";
  isAMG?: boolean;
}) {
  const reduced = usePrefersReducedMotion();
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);
  const didMountRef = useRef(false);
  const [edgeFade, setEdgeFade] = useState({ left: false, right: false });

  const updateEdgeFade = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const maxScroll = container.scrollWidth - container.clientWidth;
    setEdgeFade({
      left: container.scrollLeft > 4,
      right: container.scrollLeft < maxScroll - 4,
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const el = btnRefs.current[activeId];
    if (!container || !el) return;

    const target = Math.max(
      0,
      Math.min(
        el.offsetLeft - (container.clientWidth - el.offsetWidth) / 2,
        container.scrollWidth - container.clientWidth
      )
    );

    if (!didMountRef.current) {
      // Posicionamiento inicial: directo, sin animación y sin tocar el scroll de la página.
      container.scrollLeft = target;
      didMountRef.current = true;
      updateEdgeFade();
      return;
    }

    if (reduced) {
      container.scrollLeft = target;
      updateEdgeFade();
    } else {
      container.scrollTo({ left: target, behavior: "smooth" });
    }
  }, [activeId, reduced, updateEdgeFade]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    updateEdgeFade();
    container.addEventListener("scroll", updateEdgeFade, { passive: true });
    window.addEventListener("resize", updateEdgeFade);
    return () => {
      container.removeEventListener("scroll", updateEdgeFade);
      window.removeEventListener("resize", updateEdgeFade);
    };
  }, [updateEdgeFade]);

  if (tabs.length <= 1) return null;

  const maskStops: string[] = [];
  maskStops.push(edgeFade.left ? "transparent, black 28px" : "black");
  maskStops.push(edgeFade.right ? "black calc(100% - 28px), transparent" : "black");
  const maskImage =
    edgeFade.left || edgeFade.right
      ? `linear-gradient(to right, ${maskStops.join(", ")})`
      : undefined;

  const pillClass = isAMG
    ? "bg-amg-teal text-black"
    : variant === "papel"
    ? "bg-ink text-paper-0"
    : "bg-white text-ink";

  const inactiveClass =
    variant === "papel" ? "text-silver-500 hover:text-ink" : "text-silver-500 hover:text-white";

  // Color del label ACTIVO fijado explícito según la variante de la pill —
  // nunca heredado del contexto (evita blanco-sobre-blanco en pills claras).
  const activeTextClass = isAMG ? "text-black" : variant === "papel" ? "text-paper-0" : "text-ink";

  return (
    <div
      ref={containerRef}
      role="tablist"
      className="relative flex gap-2 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden md:justify-center md:overflow-visible"
      style={{
        scrollSnapType: "x mandatory",
        maskImage,
        WebkitMaskImage: maskImage,
      }}
    >
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              btnRefs.current[tab.id] = el;
            }}
            role="tab"
            id={`${scope}-tab-${tab.id}`}
            aria-selected={active}
            aria-controls={`${scope}-panel`}
            onClick={() => onChange(tab.id)}
            className={`relative isolate shrink-0 whitespace-nowrap px-4 py-2 text-xs font-light tracking-wider uppercase transition-colors sm:text-sm ${
              active ? activeTextClass : inactiveClass
            }`}
            style={{ scrollSnapAlign: "start" }}
          >
            {active && (
              <motion.span
                layoutId={`tab-pill-${scope}`}
                className={`absolute inset-0 -z-10 ${pillClass}`}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { duration: DUR.element, ease: EASE.secondary }
                }
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
