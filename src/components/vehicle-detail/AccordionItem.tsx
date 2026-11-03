"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DUR, EASE, GSAP_EASE } from "@/lib/motion-tokens";
import { registerGsap, prefersReduced } from "./useSectionReveal";
import { usePointerFine } from "./usePointerFine";

const pad = (n: number) => String(n).padStart(2, "0");

// Accordion Item Component
export function AccordionItem({
  title,
  specs,
  isOpen,
  onToggle,
  index,
  isAMG = false,
  anyOpen,
}: {
  title: string;
  specs: { label: string; valor: string }[];
  isOpen: boolean;
  onToggle: () => void;
  /** Posición de la categoría (0-based) — alimenta la numeración mono `01–09` (CSS ::before, no en DOM text). */
  index: number;
  isAMG?: boolean;
  /** true si alguna categoría está abierta (activa el atenuado de las no-activas). */
  anyOpen: boolean;
}) {
  const headerRef = useRef<HTMLButtonElement>(null);
  const separatorRef = useRef<HTMLSpanElement>(null);
  const titleInnerRef = useRef<HTMLHeadingElement>(null);
  const [numRevealed, setNumRevealed] = useState(() => prefersReduced());
  const reduced = prefersReduced();
  const pointerFine = usePointerFine();

  useEffect(() => {
    const el = headerRef.current;
    if (!el || !separatorRef.current || !titleInnerRef.current) return;
    registerGsap();
    if (prefersReduced()) {
      gsap.set(separatorRef.current, { scaleX: 1 });
      gsap.set(titleInnerRef.current, { yPercent: 0 });
      return;
    }
    gsap.set(separatorRef.current, { scaleX: 0 });
    gsap.set(titleInnerRef.current, { yPercent: 30 });
    const tl = gsap.timeline({ paused: true });
    tl.to(separatorRef.current, {
      scaleX: 1,
      duration: DUR.element,
      ease: GSAP_EASE.secondary,
    });
    tl.to(
      titleInnerRef.current,
      { yPercent: 0, duration: DUR.element, ease: GSAP_EASE.secondary },
      "-=0.3"
    );
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => {
        setNumRevealed(true);
        tl.play();
      },
    });
    return () => {
      st.kill();
      tl.kill();
    };
  }, []);

  return (
    <div
      className={`relative border-b ${
        isAMG
          ? isOpen
            ? "border-amg-teal/40 bg-gradient-to-r from-amg-teal/10 to-transparent"
            : "border-amg-teal/20 hover:border-amg-teal/40"
          : "border-gray-200"
      } ${
        !isOpen && anyOpen && pointerFine ? "opacity-55 hover:opacity-100" : "opacity-100"
      } transition-[color,opacity] duration-[var(--dur-element)] ease-[var(--ease-secondary)]`}
    >
      <span
        aria-hidden
        data-chrome
        ref={separatorRef}
        className={`absolute inset-x-0 bottom-0 h-px origin-left ${
          isAMG ? "bg-amg-teal/40" : "bg-gray-300"
        }`}
        style={{ transform: "scaleX(0)" }}
      />
      <button
        ref={headerRef}
        id={`accordion-header-${index}`}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`accordion-panel-${index}`}
        data-num={pad(index + 1)}
        className={`flex min-h-11 w-full items-center justify-between gap-4 px-4 py-5 text-left transition-colors before:mr-4 before:shrink-0 before:font-mono before:text-sm before:tabular-nums before:tracking-[0.15em] before:transition-opacity before:duration-[var(--dur-element)] before:ease-[var(--ease-secondary)] before:content-[attr(data-num)] ${
          isOpen ? "before:opacity-100" : numRevealed ? "before:opacity-40" : "before:opacity-0"
        } ${isAMG ? "hover:bg-amg-teal/5" : "hover:bg-black/5"}`}
      >
        <div className="flex-1 overflow-hidden">
          <h3
            ref={titleInnerRef}
            className={`text-lg md:text-xl font-light ${
              isAMG ? (isOpen ? "text-amg-teal" : "text-white") : ""
            }`}
          >
            {title}
          </h3>
        </div>
        <span
          aria-hidden
          data-chrome
          className={`shrink-0 font-mono text-2xl leading-none transition-transform duration-[var(--dur-micro)] ease-[var(--ease-micro)] ${
            isOpen ? "rotate-45" : "rotate-0"
          } ${isAMG ? "text-amg-teal" : ""}`}
        >
          +
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`accordion-panel-${index}`}
            role="region"
            aria-labelledby={`accordion-header-${index}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: DUR.element, ease: EASE.secondary }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-6">
              {specs.map((spec, i) => (
                <motion.div
                  key={i}
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: DUR.element, ease: EASE.secondary, delay: i * 0.05 }}
                  className={`flex flex-col gap-1 py-3 md:min-h-[56px] md:flex-row md:items-baseline md:justify-between md:gap-4 ${
                    isAMG ? "border-b border-amg-teal/10" : "border-b border-gray-100"
                  }`}
                >
                  <span
                    className={`font-mono uppercase text-[11px] tracking-[0.1em] ${
                      isAMG ? "text-silver-500" : "text-silver-700"
                    }`}
                  >
                    {spec.label}
                  </span>
                  <span
                    className={`font-sans tabular-nums text-sm md:text-base text-left md:text-right ${
                      isAMG ? "text-white" : "text-black"
                    }`}
                  >
                    {spec.valor}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
