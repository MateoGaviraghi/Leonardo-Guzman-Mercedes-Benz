"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Wrapper del <main> del root layout.
 * En el sitio público agrega pt-20 para despejar el Navbar fixed.
 * En /crm/* y /admin/* no hay Navbar global, así que no hace falta padding.
 */
export function MainWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isApp =
    pathname.startsWith("/crm") || pathname.startsWith("/admin");

  return (
    <main className={["flex-grow", isApp ? "" : "pt-20"].join(" ").trim()}>
      {children}
    </main>
  );
}
