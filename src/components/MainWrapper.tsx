"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Wrapper del <main> del root layout.
 * En el sitio público agrega pt-20 para despejar el Navbar fixed —
 * EXCEPTO en rutas con hero full-bleed (/, /experiencia, /vehicles, /usados
 * y /financiacion), donde el cine exige media hasta el borde superior
 * (chrome-global §2.3).
 * En /crm/* y /admin/* no hay Navbar global, así que no hace falta padding.
 */
export function MainWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isApp = pathname.startsWith("/crm") || pathname.startsWith("/admin");
  const fullBleed =
    pathname === "/" ||
    pathname.startsWith("/experiencia") ||
    pathname.startsWith("/vehicles") ||
    pathname === "/usados" ||
    pathname === "/financiacion";

  return (
    <main
      id="main-content"
      className={["flex-grow", isApp || fullBleed ? "" : "pt-20"]
        .join(" ")
        .trim()}
    >
      {children}
    </main>
  );
}
