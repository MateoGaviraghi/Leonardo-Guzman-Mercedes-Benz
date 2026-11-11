"use client";

import { useRef, type ReactNode } from "react";

// Botón platino (referencia: Metallic Button de starc007, rehecho acá).
// Mateo (2026-11-10): «me gustaba más con bordes redondos el consultar en ambos y que
// sea como más platino, más premium, 3D platino, no tan estático».
// - Platino frío con relieve: brillo arriba, canto claro, sombra abajo, letras grabadas.
// - Vivo: la luz recorre el metal despacio (7 s, ida y vuelta; se apaga con
//   movimiento reducido) y al pasar el mouse un reflejo sigue al puntero.
// - Al pasar el mouse se levanta 1 px; al apretar se hunde.
const PLATINO =
  "linear-gradient(110deg,#9aa2ab 0%,#e6eaee 16%,#ffffff 27%,#c2c9d1 40%,#f7f9fb 54%,#a5adb6 69%,#eef1f4 84%,#b6bdc5 100%)";

export function BotonCromo({
  href,
  children,
  externo = false,
  className = "",
}: {
  href: string;
  children: ReactNode;
  externo?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const mover = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <a
      ref={ref}
      href={href}
      onPointerMove={mover}
      {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      style={{ backgroundImage: PLATINO, backgroundSize: "260% 100%" }}
      className={`platino-vivo group relative inline-flex h-11 items-center justify-center overflow-hidden rounded-full px-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#1b1e22] [text-shadow:0_1px_0_rgba(255,255,255,0.65)] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-2px_3px_rgba(55,61,69,0.35),inset_0_0_0_1px_rgba(255,255,255,0.35),0_1px_0_rgba(0,0,0,0.3),0_12px_26px_-10px_rgba(0,0,0,0.75)] transition-[transform,box-shadow] duration-[700ms] ease-[var(--ease-primary)] hover:-translate-y-px hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_-2px_3px_rgba(55,61,69,0.4),inset_0_0_0_1px_rgba(255,255,255,0.45),0_1px_0_rgba(0,0,0,0.3),0_18px_32px_-12px_rgba(0,0,0,0.85)] active:translate-y-px active:shadow-[inset_0_2px_6px_rgba(40,45,52,0.45),0_4px_10px_-6px_rgba(0,0,0,0.6)] active:duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${className}`}
    >
      {/* brillo superior (vidrio sobre metal) */}
      <span aria-hidden className="pointer-events-none absolute inset-x-[8%] top-px h-[46%] rounded-full bg-gradient-to-b from-white/75 to-white/0" />
      {/* reflejo que sigue al puntero */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-[600ms] group-hover:opacity-100"
        style={{ background: "radial-gradient(circle at var(--mx,50%) var(--my,30%), rgba(255,255,255,0.95), rgba(255,255,255,0) 48%)" }}
      />
      <span className="relative">{children}</span>
    </a>
  );
}
