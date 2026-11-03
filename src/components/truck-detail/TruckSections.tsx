"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import type { Vehicle } from "@/data/vehicles";
import { DUR, GSAP_EASE } from "@/lib/motion-tokens";
import { MultiFormatImage } from "@/components/vehicle-detail/MultiFormatImage";
import { EmptyMedia } from "@/components/vehicle-detail/EmptyMedia";

// Registro de plugins a nivel de módulo — mismo patrón que /financiacion:
// los efectos de las filas crean su propio ScrollTrigger en su primer
// render, así que el registro no puede esperar a un useEffect del padre.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

const pad = (n: number) => String(n).padStart(2, "0");

type Theme = "dark" | "light";

/* ═══════════════════════════════════════════════
   TRUCK SECTION VISUAL — mismo patrón GSAP que ProductVisual de
   /financiacion: clip-path direccional (izq/der según el lado real de
   la imagen), ScrollTrigger start "top 82%" once, duration DUR.hero,
   ease GSAP_EASE.primary. Reduced-motion → visible de una.
   ═══════════════════════════════════════════════ */
function TruckSectionVisual({
  basePath,
  alt,
  revealFrom,
  theme,
}: {
  basePath: string;
  alt: string;
  revealFrom: "left" | "right";
  theme: Theme;
}) {
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !frameRef.current) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const el = frameRef.current;
    const hiddenClip =
      revealFrom === "left" ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)";

    if (reduced) {
      gsap.set(el, { clipPath: "inset(0% 0% 0% 0%)" });
      return;
    }

    gsap.set(el, { clipPath: hiddenClip });
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 82%",
      once: true,
      onEnter: () =>
        gsap.to(el, {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: DUR.hero,
          ease: GSAP_EASE.primary,
        }),
    });
    return () => trigger.kill();
  }, [revealFrom]);

  return (
    <div
      ref={frameRef}
      className="relative aspect-[16/10] overflow-hidden group"
    >
      <div className="absolute inset-0">
        <EmptyMedia aspect="16/9" tone={theme === "light" ? "light" : "dark"} className="h-full" />
      </div>
      <MultiFormatImage
        basePath={basePath}
        alt={alt}
        className="object-cover transition-transform duration-[var(--dur-element)] ease-[var(--ease-secondary)] group-hover:scale-[1.03]"
        sizes="(max-width: 1024px) 100vw, 58vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--dur-element)] ease-[var(--ease-secondary)]" />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TRUCK SECTION COPY — mismo patrón GSAP que ProductCopy de
   /financiacion: título con SplitText mask-reveal (yPercent 115,
   duration DUR.hero, ease primary), descripción y lista entran en X
   (dirección opuesta a la imagen) con stagger 0.08, ScrollTrigger
   start "top 78%" once, timeline delay 0.12.
   ═══════════════════════════════════════════════ */
function TruckSectionCopy({
  index,
  title,
  content,
  items,
  slideFrom,
  numColor,
  dividerColor,
  titleColor,
  bodyColor,
  dotColor,
}: {
  index: number;
  title: string;
  content?: string;
  items?: string[];
  slideFrom: "left" | "right";
  numColor: string;
  dividerColor: string;
  titleColor: string;
  bodyColor: string;
  dotColor: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !rootRef.current) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const root = rootRef.current;
    const titleEl = root.querySelector<HTMLElement>("[data-copy-title]");
    const descEl = root.querySelector("[data-copy-desc]");
    const listItems = root.querySelectorAll("[data-copy-item]");
    const hasItems = listItems.length > 0;
    const startX = slideFrom === "left" ? -28 : 28;

    if (reduced) {
      if (titleEl) gsap.set(titleEl, { opacity: 1 });
      const targets = descEl
        ? [descEl, ...Array.from(listItems)]
        : Array.from(listItems);
      if (targets.length) gsap.set(targets, { opacity: 1, x: 0 });
      return;
    }

    if (titleEl) gsap.set(titleEl, { autoAlpha: 0 });
    if (descEl) gsap.set(descEl, { opacity: 0, x: startX });
    if (hasItems) gsap.set(listItems, { opacity: 0, x: startX * 0.6 });

    let split: SplitText | undefined;
    let cancelled = false;

    const trigger = ScrollTrigger.create({
      trigger: root,
      start: "top 78%",
      once: true,
      onEnter: () => {
        if (titleEl) {
          document.fonts.ready.then(() => {
            if (cancelled || !titleEl) return;
            split = SplitText.create(titleEl, {
              type: "lines",
              mask: "lines",
              autoSplit: true,
              onSplit(self) {
                return gsap
                  .timeline()
                  .set(titleEl, { autoAlpha: 1 })
                  .from(self.lines, {
                    yPercent: 115,
                    duration: DUR.hero,
                    ease: GSAP_EASE.primary,
                  });
              },
            });
          });
        }

        const tl = gsap.timeline({ delay: 0.12 });
        if (descEl) {
          tl.to(descEl, {
            opacity: 1,
            x: 0,
            duration: DUR.element,
            ease: GSAP_EASE.secondary,
          });
        }
        if (hasItems) {
          tl.to(
            listItems,
            {
              opacity: 1,
              x: 0,
              duration: DUR.element,
              ease: GSAP_EASE.secondary,
              stagger: 0.08,
            },
            descEl ? "-=0.25" : 0,
          );
        }
      },
    });

    return () => {
      cancelled = true;
      trigger.kill();
      split?.revert();
    };
  }, [slideFrom]);

  return (
    <div ref={rootRef}>
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <span
          aria-hidden="true"
          data-chrome
          data-num={pad(index + 1)}
          className={`font-mono text-[11px] tracking-wider ${numColor} before:content-[attr(data-num)]`}
        />
        <div aria-hidden="true" data-chrome className={`w-8 h-px ${dividerColor}`} />
      </div>

      <h3
        data-copy-title
        className={`text-3xl md:text-4xl font-extralight tracking-tight ${titleColor} mb-6 md:mb-8 leading-[1.15]`}
      >
        {title}
      </h3>

      {content && (
        <p
          data-copy-desc
          className={`text-sm md:text-[15px] ${bodyColor} leading-[1.9] font-light mb-6`}
        >
          {content}
        </p>
      )}

      {items && items.length > 0 && (
        <ul className="space-y-4">
          {items.map((item, i) => (
            <li key={i} data-copy-item className="flex items-start gap-4">
              <div className={`mt-2 w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
              <span className={`text-sm md:text-[15px] ${bodyColor} leading-relaxed font-light`}>
                {item}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TRUCK SECTION — Alternating image + content
   Numeración mono 01-0N vía data-chrome/::before (fuera del innerText),
   entrada GSAP idéntica a /financiacion (clip-path en la imagen + split
   mask-reveal en el título + slide en X del copy), imagen ancla la
   altura de la fila.
   ═══════════════════════════════════════════════ */
function TruckSection({
  section,
  imageBase,
  index,
  isReversed,
}: {
  section: NonNullable<Vehicle["truckSections"]>[number];
  imageBase: string;
  index: number;
  isReversed: boolean;
}) {
  // Alternancia determinística por índice — 1ra sección (índice par) = papel, siguiente = negro.
  const isPapel = index % 2 === 0;
  const theme: Theme = isPapel ? "light" : "dark";
  const numColor = isPapel ? "text-ink/30" : "text-white/20";
  const dividerColor = isPapel ? "bg-stroke-ink" : "bg-white/15";
  const titleColor = isPapel ? "text-ink" : "text-white";
  const bodyColor = isPapel ? "text-ink-60" : "text-white/55";
  const dotColor = isPapel ? "bg-ink/25" : "bg-white/25";

  // Mismo criterio que ProductRow: el lado real de la imagen determina de
  // dónde entra el clip-path; el copy entra desde el lado opuesto.
  const imageSide: "left" | "right" = isReversed ? "right" : "left";
  const slideFrom: "left" | "right" = imageSide === "left" ? "right" : "left";

  return (
    <section
      className={`relative py-16 md:py-24 ${isPapel ? "section-paper" : "bg-mb-black"}`}
      {...(isPapel ? { "data-nav-theme": "papel" } : {})}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Image — larger (7 cols) */}
          <div
            className={`${isReversed ? "lg:col-start-6 lg:col-end-13 lg:order-2" : "lg:col-span-7"}`}
          >
            <TruckSectionVisual
              basePath={imageBase}
              alt={section.title}
              revealFrom={imageSide}
              theme={theme}
            />
          </div>

          {/* Content — 5 cols */}
          <div
            className={`${isReversed ? "lg:col-start-1 lg:col-end-6 lg:order-1" : "lg:col-start-8 lg:col-end-13"}`}
          >
            <TruckSectionCopy
              index={index}
              title={section.title}
              content={section.content}
              items={section.items}
              slideFrom={slideFrom}
              numColor={numColor}
              dividerColor={dividerColor}
              titleColor={titleColor}
              bodyColor={bodyColor}
              dotColor={dotColor}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   SECTIONS — Alternating image + content
   Estructura conservada (identidad trucks); entrada GSAP alineada con
   /financiacion.
   ═══════════════════════════════════════════════ */
export function TruckSections({
  vehicle,
  basePath,
}: {
  vehicle: Vehicle;
  basePath: string;
}) {
  const sections = vehicle.truckSections || [];

  if (sections.length === 0) return null;

  return (
    <div>
      {sections.map((section, idx) => (
        <TruckSection
          key={idx}
          section={section}
          imageBase={`${basePath}/sections/${idx + 1}`}
          index={idx}
          isReversed={idx % 2 !== 0}
        />
      ))}
    </div>
  );
}
