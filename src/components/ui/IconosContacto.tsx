"use client";

import { useEffect, useRef } from "react";
import { SITE } from "@/lib/site";

// Íconos de contacto en 3D (2026-11-10, Mateo eligió la opción 1 «logo extruido»).
// Cada logo oficial está armado en 3D con laca brillante y renderizado de antemano en
// 25 ángulos (−24° a +24°), en una tira por logo: public/iconos-3d/<logo>.webp. El
// generador vive en carga/herramientas-fotos/iconos-3d/ (three.js solo ahí). En la web
// no hay WebGL en vivo: se muestra el cuadro que corresponde a la posición del mouse o
// del dedo, vuelve al centro con un rebote suave al soltar, y cada 5 s uno de los cuatro
// se balancea solo (Mateo: «1 sí, 2 laca»). Con movimiento reducido quedan quietos de frente.
// Google Maps queda afuera a propósito (OQ-017).

const CUADROS = 25;
const CENTRO = (CUADROS - 1) / 2;

const ICONOS = [
  { logo: "whatsapp", href: SITE.whatsapp, etiqueta: "WhatsApp de Leonardo Guzman", externo: true },
  { logo: "instagram", href: SITE.instagram, etiqueta: "Instagram de Leonardo Guzman", externo: true },
  { logo: "telefono", href: SITE.phoneHref, etiqueta: "Llamar a Leonardo Guzman", externo: false },
  { logo: "gmail", href: `mailto:${SITE.email}`, etiqueta: "Escribir un mail a Leonardo Guzman", externo: false },
] as const;

// Posición (en cuadros, 0 a 24) de cada ícono; se escribe directo al estilo, sin re-render.
function pintar(el: HTMLElement | null, pos: number) {
  if (!el) return;
  const f = Math.round(Math.min(CUADROS - 1, Math.max(0, pos)));
  el.style.backgroundPositionX = `${(f / (CUADROS - 1)) * 100}%`;
}

export function IconosContacto({ className = "" }: { className?: string }) {
  const caras = useRef<(HTMLSpanElement | null)[]>([]);
  const pos = useRef<number[]>(ICONOS.map(() => CENTRO));
  const objetivo = useRef<number[]>(ICONOS.map(() => CENTRO));
  const agarrado = useRef<boolean[]>(ICONOS.map(() => false));
  const fila = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (quieto) return;
    let raf = 0;
    let visible = false;
    let turno = 0;
    let balanceo: { i: number; t0: number } | null = null;

    // Un solo bucle para los cuatro: persigue el objetivo con un resorte suave.
    const vel = ICONOS.map(() => 0);
    const paso = (t: number) => {
      if (balanceo) {
        const k = (t - balanceo.t0) / 1800;
        if (k >= 1 || agarrado.current[balanceo.i]) {
          if (!agarrado.current[balanceo.i]) objetivo.current[balanceo.i] = CENTRO;
          balanceo = null;
        } else {
          // ida y vuelta: centro → derecha → izquierda → centro
          objetivo.current[balanceo.i] = CENTRO + Math.sin(k * Math.PI * 2) * CENTRO * 0.9;
        }
      }
      ICONOS.forEach((_, i) => {
        const d = objetivo.current[i] - pos.current[i];
        vel[i] = (vel[i] + d * 0.12) * 0.72;
        pos.current[i] += vel[i];
        pintar(caras.current[i], pos.current[i]);
      });
      raf = requestAnimationFrame(paso);
    };

    const reloj = window.setInterval(() => {
      if (!visible || balanceo) return;
      const i = turno % ICONOS.length;
      turno += 1;
      if (!agarrado.current[i]) balanceo = { i, t0: performance.now() };
    }, 5000);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(paso);
    });
    if (fila.current) io.observe(fila.current);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.clearInterval(reloj);
    };
  }, []);

  const mover = (i: number) => (e: React.PointerEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    agarrado.current[i] = true;
    objetivo.current[i] = x * (CUADROS - 1);
  };
  const soltar = (i: number) => () => {
    agarrado.current[i] = false;
    objetivo.current[i] = CENTRO;
  };

  return (
    <div ref={fila} className={`flex items-center gap-4 ${className}`}>
      {ICONOS.map((ic, i) => (
        <a
          key={ic.logo}
          href={ic.href}
          aria-label={ic.etiqueta}
          onPointerMove={mover(i)}
          onPointerLeave={soltar(i)}
          onPointerUp={soltar(i)}
          onPointerCancel={soltar(i)}
          {...(ic.externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="group grid h-14 w-14 touch-pan-y place-items-center"
        >
          <span
            ref={(el) => {
              caras.current[i] = el;
            }}
            aria-hidden="true"
            className="block h-[3.25rem] w-[3.25rem] bg-no-repeat transition-transform duration-300 ease-[var(--ease-primary)] [filter:drop-shadow(0_10px_10px_rgba(0,0,0,0.55))] group-hover:-translate-y-0.5 group-active:translate-y-px group-active:scale-[0.93]"
            style={{
              backgroundImage: `url(/iconos-3d/${ic.logo}.webp)`,
              backgroundSize: `${CUADROS * 100}% 100%`,
              backgroundPositionX: "50%",
            }}
          />
        </a>
      ))}
    </div>
  );
}
