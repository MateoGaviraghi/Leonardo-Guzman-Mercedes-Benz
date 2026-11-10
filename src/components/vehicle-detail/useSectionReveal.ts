"use client";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DUR, GSAP_EASE } from "@/lib/motion-tokens";

export function registerGsap() {
  if (typeof window === "undefined") return;
  const w = window as Window & { __gsapScrollTriggerRegistered?: boolean; __gsapSplitTextRegistered?: boolean };
  if (!w.__gsapScrollTriggerRegistered) { gsap.registerPlugin(ScrollTrigger); w.__gsapScrollTriggerRegistered = true; }
  if (!w.__gsapSplitTextRegistered) { gsap.registerPlugin(SplitText); w.__gsapSplitTextRegistered = true; }
}
export const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// h2 de sección: SplitText LINES enmascaradas, yPercent 100->0, stagger 0.25 (=DUR.element-0.3),
// once. Eyebrow (opcional) entra 0.1 antes con clip horizontal. reduced -> visible inmediato.
export function useMaskedLinesReveal(
  ref: React.RefObject<HTMLElement | null>,
  opts?: { eyebrowRef?: React.RefObject<HTMLElement | null>; start?: string }
) {
  // Sacados de `opts` para listarlos como dependencias: los que llaman pasan
  // refs (estables) y textos fijos, así que el efecto sigue corriendo una vez.
  const eyebrowRef = opts?.eyebrowRef;
  const start = opts?.start;
  useEffect(() => {
    const el = ref.current; if (!el) return;
    registerGsap();
    if (prefersReduced()) {
      gsap.set(el, { autoAlpha: 1 });
      if (eyebrowRef?.current) gsap.set(eyebrowRef.current, { autoAlpha: 1 });
      return;
    }
    gsap.set(el, { autoAlpha: 0 });
    let split: SplitText | undefined; let st: ScrollTrigger | undefined;
    document.fonts.ready.then(() => {
      if (!ref.current) return;
      split = SplitText.create(el, {
        type: "lines", mask: "lines", autoSplit: true,
        onSplit(self) {
          const tl = gsap.timeline({ paused: true });
          gsap.set(el, { autoAlpha: 1 });
          if (eyebrowRef?.current)
            tl.from(eyebrowRef.current, { autoAlpha: 0, clipPath: "inset(0 100% 0 0)", duration: DUR.element, ease: GSAP_EASE.secondary }, 0);
          tl.from(self.lines, { yPercent: 100, duration: DUR.element, ease: GSAP_EASE.secondary, stagger: 0.25 }, eyebrowRef?.current ? 0.1 : 0);
          st = ScrollTrigger.create({ trigger: el, start: start ?? "top 85%", once: true, onEnter: () => tl.play() });
          return tl as unknown as gsap.core.Timeline;
        },
      });
    });
    return () => { st?.kill(); split?.revert(); };
  }, [ref, eyebrowRef, start]);
}
