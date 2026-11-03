// src/lib/motion-tokens.ts — única fuente de verdad de motion en JS.
// Espejo de los tokens CSS de globals.css (@theme).
// Prohibido en todo el proyecto: back.out, spring, elastic, bounce.

export const EASE = {
  primary: [0.16, 1, 0.3, 1] as const, // GSAP: "expo.out"  → entradas hero, page transition, CTA primario
  secondary: [0.22, 1, 0.36, 1] as const, // GSAP: "power4.out" → cards, image reveals, modales, tabs
  scrub: [0.83, 0, 0.17, 1] as const, // GSAP: "power4.inOut" → overlays experiencia, transforms scrubbeados
  micro: [0, 0.55, 0.45, 1] as const, // GSAP: "circ.out"  → chips, toggles, hover nav, underlines
} as const;

export const GSAP_EASE = {
  primary: "expo.out",
  secondary: "power4.out",
  scrub: "power4.inOut",
  micro: "circ.out",
} as const;

export const DUR = {
  micro: 0.18,
  element: 0.55,
  hero: 1.1,
} as const;

// Regla E/E/E: exits ≈ 60% de su entrada, ease-in, mismo eje.
export const EXIT = {
  element: DUR.element * 0.6, // 0.33
  hero: DUR.hero * 0.6, // 0.66
} as const;

// La page transition posee el primer paint; opacity-only (no retiene transform).
export const PAGE_TRANSITION = {
  in: 0.3,
  y: 12, // token disponible para reveals de hero; la transición de página ya NO lo usa
} as const;

// Delay de todo hero moment tras navegación. Desacoplado de PAGE_TRANSITION.in:
// el hero corre EN PARALELO a la entrada de página, no en serie.
export const HERO_DELAY = 0.12;

// Tokens específicos del detalle de vehículo (WU0 — SPEC §3.1).
export const DETAIL = {
  kenBurns: 1.6,
  ticker: 1.4,
  parallaxYPercent: 5,
  parallaxYPercentMobile: 4,
  focusDim: 0.5,
  cardScale: 1.03,
} as const;
