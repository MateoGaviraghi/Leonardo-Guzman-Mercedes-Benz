"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { waLink, WA_GENERIC_MESSAGE } from "@/lib/site";

/**
 * Chip WhatsApp flotante global (chrome-global §2.5).
 * - Aparece cuando el sentinel `[data-hero-sentinel]` de la página sale del
 *   viewport por arriba (fallback: scrollY > 200 si la página no tiene sentinel).
 * - Una vez visible, queda visible (no re-oculta al volver arriba).
 * - Se oculta durante segmentos pinneados vía CSS: html[data-pin-active] .wa-chip.
 * - Desktop con hover fino: se expande a pill con el label "Escribime".
 * - Único uso permitido del token --color-whatsapp junto a los CTAs de página.
 */
export default function WhatsAppChip() {
  const pathname = usePathname();
  // /contact: oculto — la página ES el formulario de WhatsApp (chip
  // redundante) y su hitbox colisionaba con el botón de envío del tablero.
  const hidden =
    pathname.startsWith("/crm") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/contact");

  const [visible, setVisible] = useState(false);
  // Reset síncrono al cambiar de ruta (patrón React "ajustar estado cuando
  // cambia una prop": setState en el CUERPO del render, no en un efecto —
  // evita el flash de estado stale antes de que el efecto de abajo vuelva a
  // suscribir el sentinel/scroll de la nueva página).
  const [trackedPathname, setTrackedPathname] = useState(pathname);
  if (pathname !== trackedPathname) {
    setTrackedPathname(pathname);
    setVisible(false);
  }

  useEffect(() => {
    if (hidden) return;

    let observer: IntersectionObserver | null = null;
    let onScroll: (() => void) | null = null;

    // El sentinel se monta con la página (post page-transition): buscarlo
    // con un pequeño delay y re-intentar una vez.
    const attach = () => {
      const sentinel = document.querySelector("[data-hero-sentinel]");
      if (sentinel) {
        observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              // Sentinel salió por arriba del viewport → mostrar y no re-ocultar
              if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
                setVisible(true);
                observer?.disconnect();
              }
            }
          },
          { threshold: 0 }
        );
        observer.observe(sentinel);
      } else {
        // Fallback: páginas sin sentinel
        onScroll = () => {
          if (window.scrollY > 200) {
            setVisible(true);
            if (onScroll) window.removeEventListener("scroll", onScroll);
          }
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
      }
    };

    const t = window.setTimeout(attach, 600);
    return () => {
      window.clearTimeout(t);
      observer?.disconnect();
      if (onScroll) window.removeEventListener("scroll", onScroll);
    };
  }, [pathname, hidden]);

  if (hidden) return null;

  return (
    <a
      href={waLink(WA_GENERIC_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir a Leonardo Guzman por WhatsApp"
      className={[
        "wa-chip group fixed z-40 flex items-center overflow-hidden",
        "h-14 min-w-14 bg-whatsapp text-white",
        "border border-white/25",
        "right-[clamp(16px,4vw,32px)]",
        "bottom-[calc(clamp(16px,4vw,32px)+env(safe-area-inset-bottom))]",
        "transition-[opacity,transform,max-width] ease-[var(--ease-secondary)]",
        "active:scale-[0.97]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-mb-blue focus-visible:outline-offset-[3px]",
        // Expansión pill solo en desktop (pointer fino)
        "max-w-14 lg:hover:max-w-[170px] lg:focus-visible:max-w-[170px]",
        visible
          ? "opacity-100 translate-y-0 duration-[var(--dur-element)]"
          : "opacity-0 translate-y-4 pointer-events-none duration-[var(--dur-micro)]",
      ].join(" ")}
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center">
        <WhatsAppIcon className="w-[26px] h-[26px]" />
      </span>
      <span className="whitespace-nowrap pr-5 text-sm font-medium opacity-0 transition-opacity duration-[var(--dur-micro)] lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100">
        Escribime
      </span>
    </a>
  );
}
