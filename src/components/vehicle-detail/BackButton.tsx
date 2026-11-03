"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/**
 * Botón "Volver" — chrome de navegación, texto puro (sin caja/borde/radius).
 * Fixed bajo el navbar, sobre el hero. history.back() si hay historial propio
 * del sitio; si no (entrada directa por URL), fallback a /vehicles.
 *
 * `fadeOnScroll` (default false → autos idéntico): se desvanece (opacity+pointer-events)
 * pasado 70vh de scroll — el affordance solo hace falta arriba del hero; usado por
 * trucks para no pisar el stats ribbon/specs en mobile.
 */
export function BackButton({ fadeOnScroll = false }: { fadeOnScroll?: boolean }) {
  const router = useRouter();
  const [hidden, setHidden] = useState(false);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!fadeOnScroll) return;
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setHidden(window.scrollY > window.innerHeight * 0.7);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [fadeOnScroll]);

  const handleClick = () => {
    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back();
    } else {
      router.push("/vehicles");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      data-chrome
      aria-label="Volver"
      className={`fixed left-4 md:left-6 top-[calc(var(--nav-h)+16px)] z-40 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-silver-100 [text-shadow:0_1px_2px_rgba(0,0,0,0.85),0_2px_10px_rgba(0,0,0,0.55)] hover:text-white ${
        fadeOnScroll
          ? `transition-[opacity,transform] duration-[var(--dur-micro)] ease-[var(--ease-micro)] motion-reduce:transition-none ${
              hidden
                ? "pointer-events-none opacity-0 -translate-y-1.5"
                : "opacity-100 translate-y-0"
            }`
          : "transition-colors duration-[var(--dur-micro)] ease-[var(--ease-micro)] motion-reduce:transition-none"
      }`}
    >
      <ArrowLeft size={14} aria-hidden />
      Volver
    </button>
  );
}
