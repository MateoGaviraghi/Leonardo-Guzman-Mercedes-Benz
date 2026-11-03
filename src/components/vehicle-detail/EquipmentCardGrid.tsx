"use client";

import { motion } from "framer-motion";
import { RichText } from "@/components/RichText";
import { DUR, EASE } from "@/lib/motion-tokens";
import { MultiFormatImage } from "./MultiFormatImage";
import { EmptyMedia } from "./EmptyMedia";
import { FocusCards, FocusCard } from "./FocusCards";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

// Card grid reutilizable para el contenido de un tab dentro de Exterior/Interior.
// Mismo patrón visual que la sección "Equipamiento" (cards con imagen + título + descripción).
//
// COMPOSICIÓN ADAPTATIVA por `items.length` (RONDA VANS) — evita cards huérfanas,
// agujeros y filas rotas con counts reales chicos de las vans:
//   1 → panel editorial (img 7col / texto 5col, salto Cormorant, SIN hover-focus).
//   2 → par comparativo al ancho completo (misma línea de base, FocusCards).
//   3 → grilla 3-col ACTUAL intacta (regresión cero).
//   4 → 2×2 al ancho del 2-up (nunca 3+1 con viuda).
//   5/6 → 3×2 disciplinado: ratio idéntico, altura de título reservada, gap
//         vertical > horizontal, prefijo mono 01–06 como chrome (CSS ::before,
//         nunca texto DOM — gate byte-a-byte vigente).
//
// `variant` controla los colores para que las cards se vean bien tanto sobre
// fondos claros (Exterior, fondo blanco) como sobre fondos oscuros (Interior, fondo negro).
export function EquipmentCardGrid({
  items,
  basePath,
  category,
  variant,
  isAMG = false,
}: {
  items: { title?: string; description?: string }[];
  basePath: string;
  /** Subcarpeta bajo `equipment/`. Ej: "variantes-carroceria", "carga", "puesto-conduccion". */
  category: string;
  /** "light" → fondo claro: títulos en negro, descripciones gris medio.
   *  "dark"  → fondo oscuro: títulos en blanco, descripciones gris claro. */
  variant: "light" | "dark";
  isAMG?: boolean;
}) {
  const reduced = usePrefersReducedMotion();

  if (items.length === 0) return null;

  const emptyTone: "light" | "dark" = variant === "light" ? "light" : "dark";
  const titleColor = isAMG
    ? "text-amg-teal"
    : variant === "light"
    ? "text-black"
    : "text-white";
  const descColor = variant === "light" ? "text-gray-600" : "text-gray-200";

  // ───────────────────────────────────────────────────────────
  // MODE 1 — panel editorial (NO grid, NO FocusCards: nada que atenuar)
  // ───────────────────────────────────────────────────────────
  if (items.length === 1) {
    const item = items[0];
    const imagePath = `${basePath}/equipment/${category}/1`;
    return (
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 24 }}
        whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
        animate={reduced ? { opacity: 1, y: 0 } : undefined}
        viewport={{ once: true }}
        transition={{ duration: DUR.element, ease: EASE.secondary }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center"
      >
        {/* Imagen 7 cols — full-width en mobile */}
        <div className="lg:col-span-7">
          <div className="relative aspect-[16/10] overflow-hidden">
            <div className="absolute inset-0">
              <EmptyMedia aspect="16/9" tone={emptyTone} className="h-full" />
            </div>
            <MultiFormatImage
              basePath={imagePath}
              alt={item.title || category}
              className="object-cover"
            />
          </div>
        </div>
        {/* Texto 5 cols — centrado vertical respecto de la imagen (items-center) */}
        <div className="lg:col-span-5">
          {item.title && (
            <h3
              className={`font-display font-light leading-[1.1] text-[clamp(1.75rem,3vw+1rem,3rem)] mb-4 sm:mb-5 ${titleColor}`}
            >
              {item.title}
            </h3>
          )}
          {item.description && (
            <RichText
              className={`text-base font-light leading-relaxed ${descColor}`}
            >
              {item.description}
            </RichText>
          )}
        </div>
      </motion.div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // MODES ≥2 — grilla con FocusCards
  // ───────────────────────────────────────────────────────────
  const count = items.length;
  const numbered = count >= 5; // 5/6 → 3×2 con prefijo mono + disciplina de filas
  // Columnas en lg (define el stagger por fila y el layout):
  //   2 → 2-up · 3 → 3-col ACTUAL · 4 → 2×2 · 5/6 → 3-col.
  const cols = count === 2 || count === 4 ? 2 : 3;

  const gridClass =
    count === 2
      ? "grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 lg:gap-12"
      : count === 4
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8"
      : numbered
      ? // 5/6 → 3×2: gap vertical (row) > gap horizontal (column), ratio idéntico
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10 sm:gap-x-6 sm:gap-y-12"
      : // 3 → grilla 3-col ACTUAL intacta (regresión cero)
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6";

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <FocusCards className={gridClass}>
      {items.map((item, index) => {
        const imagePath = `${basePath}/equipment/${category}/${index + 1}`;
        const delay = Math.floor(index / cols) * 0.25;
        return (
          <motion.div
            key={index}
            initial={reduced ? false : { opacity: 0, scale: 0.97 }}
            whileInView={reduced ? undefined : { opacity: 1, scale: 1 }}
            animate={reduced ? { opacity: 1, scale: 1 } : undefined}
            viewport={{ once: true }}
            transition={{
              duration: DUR.element,
              ease: EASE.secondary,
              delay,
            }}
          >
            <FocusCard>
              <div
                className={`relative aspect-[4/3] overflow-hidden ${
                  numbered ? "mb-4 sm:mb-5" : "mb-3 sm:mb-4"
                }`}
              >
                {/* Empty-state reservado detrás — nunca void */}
                <div className="absolute inset-0">
                  <EmptyMedia
                    aspect="4/3"
                    tone={emptyTone}
                    className="h-full"
                  />
                </div>
                <MultiFormatImage
                  basePath={imagePath}
                  alt={item.title || category}
                  className="object-cover"
                />
              </div>
              {(item.title || item.description) && (
                <div className="py-2 sm:py-3">
                  {/* Prefijo numerado 01–06 como chrome CSS (::before + data-num):
                      NUNCA texto DOM — el innerText no cambia (gate byte-a-byte). */}
                  {numbered && (
                    <span
                      aria-hidden="true"
                      data-num={pad(index + 1)}
                      className={`block font-mono text-[11px] tracking-[0.25em] tabular-nums mb-2 before:content-[attr(data-num)] ${
                        isAMG ? "text-amg-teal/70" : "text-silver-500"
                      }`}
                    />
                  )}
                  {item.title && (
                    <h4
                      className={
                        numbered
                          ? `text-base sm:text-lg font-light mb-1 sm:mb-2 leading-snug min-h-[2.6em] ${titleColor}`
                          : `text-base sm:text-lg font-light mb-1 sm:mb-2 ${titleColor}`
                      }
                    >
                      {item.title}
                    </h4>
                  )}
                  {item.description && (
                    <RichText
                      className={`text-sm font-light leading-relaxed ${descColor}`}
                    >
                      {item.description}
                    </RichText>
                  )}
                </div>
              )}
            </FocusCard>
          </motion.div>
        );
      })}
    </FocusCards>
  );
}
