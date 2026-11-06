"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Menu, X, Instagram, Facebook, Phone } from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { SITE, waLink, WA_GENERIC_MESSAGE } from "@/lib/site";
import { EASE, DUR } from "@/lib/motion-tokens";

/** Links del navbar (chrome-global §2.4) — orden y copy FINAL. */
const NAV_LINKS = [
  { label: "Vehículos", href: "/vehicles" },
  { label: "Experiencia", href: "/experiencia" },
  { label: "Usados", href: "/usados" },
  { label: "Financiación", href: "/financiacion" },
  { label: "Plan de Ahorro", href: "/plan-ahorro" },
  { label: "Sobre mí", href: "/about" },
  { label: "Contacto", href: "/contact" },
] as const;

// Items del menú con numeración editorial 01–08 (Inicio + NAV_LINKS).
const MENU_ITEMS = [{ label: "Inicio", href: "/" }, ...NAV_LINKS] as const;

export default function Navbar() {
  const pathname = usePathname();
  const hideOnRoutes =
    pathname.startsWith("/crm") || pathname.startsWith("/admin");

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Tema dual: "cine" (negro, default) ↔ "papel" cuando una sección
  // [data-nav-theme="papel"] alcanza la franja superior del viewport.
  const [paper, setPaper] = useState(false);
  const [paperColor, setPaperColor] = useState<string | null>(null);
  // Trackea el pathname que produjo el último reset de "paper" — permite
  // resetear el tema al cambiar de ruta durante el render (en vez de un
  // setState síncrono dentro del efecto) antes de que el observer más abajo
  // determine el valor real de la nueva página.
  const [paperResetPathname, setPaperResetPathname] = useState(pathname);
  if (paperResetPathname !== pathname) {
    setPaperResetPathname(pathname);
    if (!hideOnRoutes) setPaper(false);
  }
  const [amg, setAmg] = useState(
    () => typeof document !== "undefined" && document.documentElement.hasAttribute("data-amg")
  );
  const reduced = useReducedMotion();

  // Refs para restaurar el foco al trigger y para atrapar el foco en el overlay.
  const triggerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Mobile (ref. Polestar): se esconde al bajar y vuelve apenas se sube.
  const [navHidden, setNavHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      const dy = y - lastY.current;
      if (y < 120) setNavHidden(false);
      else if (dy > 6) setNavHidden(true);
      else if (dy < -6) setNavHidden(false);
      if (Math.abs(dy) > 6) lastY.current = y;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    if (hideOnRoutes) return;

    let observer: IntersectionObserver | null = null;
    const intersecting = new Set<Element>();

    // Las secciones papel se montan con la página (post page-transition).
    const attach = () => {
      // En el celular también cuentan las secciones blancas del detalle de vehículo
      // (data-nav-mobile); en escritorio el header de esas páginas sigue como estaba.
      const mobile = window.innerWidth < 1024;
      const sections = document.querySelectorAll(
        mobile ? '[data-nav-theme="papel"], [data-nav-mobile="papel"]' : '[data-nav-theme="papel"]'
      );
      if (sections.length === 0) return;
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) intersecting.add(entry.target);
            else intersecting.delete(entry.target);
          }
          setPaper(intersecting.size > 0);
          // Color exacto de la sección clara de abajo (blanco puro o papel): el header
          // mobile lo copia para no dejar una franja de otro tono.
          const first = intersecting.values().next().value as Element | undefined;
          if (first) {
            const bg = getComputedStyle(first).backgroundColor;
            if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") setPaperColor(bg);
          }
        },
        // Franja superior del viewport (donde vive el navbar)
        { rootMargin: "0px 0px -92% 0px", threshold: 0 }
      );
      sections.forEach((s) => observer!.observe(s));
    };

    const t = window.setTimeout(attach, 600);
    return () => {
      window.clearTimeout(t);
      observer?.disconnect();
    };
  }, [pathname, hideOnRoutes]);

  // Modo AMG: el atributo lo setea VehiclesClient en <html>. Default false en
  // server y primer render cliente (sin hydration mismatch); tras hidratar se lee
  // el valor real y se observan cambios de brand → los acentos animan al entrar.
  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setAmg(root.hasAttribute("data-amg"));
    });
    observer.observe(root, { attributes: true, attributeFilter: ["data-amg"] });
    return () => observer.disconnect();
  }, []);

  // Scroll-lock del body con restauración de scrollY al cerrar el menú.
  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    const body = document.body;
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    return () => {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // Foco atrapado dentro del overlay + Escape para cerrar + foco de vuelta al trigger.
  useEffect(() => {
    if (!isOpen) return;
    const overlay = overlayRef.current;
    if (!overlay) return;
    const trigger = triggerRef.current;
    const focusables = () =>
      Array.from(
        overlay.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setIsOpen(false); return; }
      if (e.key !== "Tab") return;
      const els = focusables();
      if (els.length === 0) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [isOpen]);

  if (hideOnRoutes) return null;

  // Paletas del tema dual
  const textStrong = paper ? "text-ink" : "text-white";
  const textMuted = paper ? "text-ink-60" : "text-gray-400";
  const underlineBg = paper ? "bg-ink" : "bg-white";
  // Escritorio: vidrio esmerilado (sin cambios). Celular: color pleno de la sección
  // de abajo, sin el gris translúcido que dejaba el blur sobre fondos claros.
  const scrolledBg = paper
    ? "bg-[var(--nav-paper)] lg:bg-paper-0/85 lg:backdrop-blur-2xl lg:backdrop-saturate-150 border-b border-stroke-ink"
    : "bg-black lg:bg-black/55 lg:backdrop-blur-2xl lg:backdrop-saturate-150 border-b border-white/[0.08]";

  const underline = (active: boolean) =>
    `absolute -bottom-2 left-0 right-0 h-[1.5px] ${amg ? "bg-[#5AC3B6]" : underlineBg} transition-[clip-path,background-color] duration-[var(--dur-micro)] ease-[var(--ease-micro)] ${
      active
        ? "[clip-path:inset(0_0%_0_0)]"
        : "[clip-path:inset(0_100%_0_0)] group-hover:[clip-path:inset(0_0%_0_0)]"
    }`;

  // Coreografía del menú mobile: stagger 45ms por item (y + opacity desde tokens).
  const menuContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduced ? 0 : 0.045, // 45ms entre items (INTENT)
        delayChildren: reduced ? 0 : 0.05,
      },
    },
  };
  const menuItem = {
    hidden: { opacity: 0, y: reduced ? 0 : 12 }, // y = PAGE_TRANSITION.y
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: DUR.element, ease: EASE.secondary },
    },
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-[var(--nav-h)] flex items-center transition-[background-color,border-color,transform] duration-[550ms] ease-[var(--ease-secondary)] motion-reduce:transition-none ${
          scrolled ? scrolledBg : "bg-transparent"
        } ${navHidden && !isOpen ? "max-lg:-translate-y-full" : "translate-y-0"}`}
        style={{ "--nav-paper": paperColor ?? "var(--color-paper-0)" } as React.CSSProperties}
      >
        <div className="w-full px-6 md:px-12">
          <div className="hidden lg:grid lg:grid-cols-[auto_1fr_auto] items-center gap-8">
            {/* Logo — quieto en reposo; micro-giro de énfasis al hover
                (decisión del usuario 2026-07-13: vida sin idle loop) */}
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative w-12 h-12 transition-transform duration-300 ease-[var(--ease-secondary)] group-hover:rotate-[30deg]">
                <Image
                  src="/logo-mercedes-benz.png"
                  alt="Mercedes-Benz Logo"
                  fill
                  sizes="48px"
                  className="object-contain"
                  priority
                />
              </div>

              <div className="flex flex-col">
                <span className="flex items-baseline gap-2">
                  <span
                    className={`text-lg font-medium tracking-tight leading-none uppercase ${textStrong}`}
                  >
                    {SITE.name}
                  </span>
                  <AnimatePresence>
                    {amg && (
                      <motion.span
                        key="amg-suffix-desktop"
                        aria-hidden="true"
                        className="font-sans text-[11px] font-medium tracking-[0.3em] leading-none uppercase text-[#5AC3B6]"
                        initial={{ clipPath: reduced ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
                        animate={{ clipPath: "inset(0 0% 0 0)" }}
                        exit={{
                          clipPath: "inset(0 100% 0 0)",
                          transition: { duration: reduced ? 0 : 0.2, ease: EASE.secondary },
                        }}
                        transition={{
                          duration: reduced ? 0 : 0.4,
                          delay: reduced ? 0 : 0.2,
                          ease: EASE.secondary,
                        }}
                      >
                        / AMG
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
                <span
                  className={`text-xs font-medium tracking-[0.15em] leading-none mt-1 uppercase ${textMuted}`}
                >
                  {SITE.dealerShort}
                </span>
              </div>
            </Link>

            {/* Desktop Links - Centered */}
            <div className="flex items-center justify-center gap-8 xl:gap-9">
              {NAV_LINKS.map((link) => {
                const active = pathname.startsWith(link.href);
                const linkColor = active
                  ? textStrong
                  : paper
                    ? `text-ink-60 ${amg ? "hover:text-[#5AC3B6]" : "hover:text-ink"}`
                    : `text-gray-300 ${amg ? "hover:text-[#5AC3B6]" : "hover:text-white"}`;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative text-xs font-medium transition-colors duration-[var(--dur-micro)] tracking-[0.08em] uppercase group whitespace-nowrap ${linkColor}`}
                  >
                    {link.label}
                    <span className={underline(active)}></span>
                  </Link>
                );
              })}
            </div>

            {/* Social - Desktop Right Side */}
            <div
              className={`flex items-center gap-4 pl-5 ml-1 border-l ${
                paper ? "border-stroke-ink" : "border-white/10"
              }`}
            >
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity duration-[var(--dur-micro)]"
                aria-label="Instagram de Leonardo Guzman"
              >
                <Instagram className={`w-5 h-5 ${textStrong}`} strokeWidth={1.5} />
              </a>
              <a
                href={SITE.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity duration-[var(--dur-micro)]"
                aria-label="Facebook de Leonardo Guzman"
              >
                <Facebook className={`w-5 h-5 ${textStrong}`} strokeWidth={1.5} />
              </a>
              <a
                href={SITE.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity duration-[var(--dur-micro)]"
                aria-label="WhatsApp de Leonardo Guzman"
              >
                <WhatsAppIcon className={`w-5 h-5 ${textStrong}`} />
              </a>
              <a
                href={SITE.phoneHref}
                className="hover:opacity-70 transition-opacity duration-[var(--dur-micro)]"
                aria-label="Llamar a Leonardo Guzman"
              >
                <Phone className={`w-5 h-5 ${textStrong}`} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Mobile (2026-11-06, Mateo): solo la estrella a la izquierda, "Consultar"
              metálico centrado y el menú solo con las barras a la derecha. */}
          <div className="lg:hidden grid grid-cols-[1fr_auto_1fr] items-center">
            <Link href="/" aria-label={`Inicio — ${SITE.name}`} className="justify-self-start">
              <div className="relative w-9 h-9">
                <Image
                  src="/logo-mercedes-benz.png"
                  alt="Mercedes-Benz Logo"
                  fill
                  sizes="36px"
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Siempre "Consultar" (Mateo: "Volver" no decía a dónde). Acero
                metálico, estilos en globals.css (.cm-btn). */}
            <a
              href={waLink(WA_GENERIC_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="cm-btn"
            >
              <span className="cm-label">Consultar</span>
            </a>

            {/* Menú: solo las barras; la X vive en el overlay, en este mismo lugar */}
            <button
              ref={triggerRef}
              onClick={() => setIsOpen(true)}
              aria-label="Abrir menú"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              className={`justify-self-end -mr-2.5 flex items-center justify-center min-w-[44px] min-h-[44px] transition-colors duration-[550ms] ${textStrong}`}
            >
              <Menu size={24} strokeWidth={1.25} aria-hidden />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {amg && (
            <motion.span
              key="amg-hairline"
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-0 right-0 h-[1px] bg-[#5AC3B6]/40"
              initial={{ scaleX: reduced ? 1 : 0, transformOrigin: "left center" }}
              animate={{ scaleX: 1, transformOrigin: "left center" }}
              exit={{
                scaleX: 0,
                transformOrigin: "right center",
                transition: { duration: reduced ? 0 : 0.35, ease: EASE.secondary },
              }}
              transition={{ duration: reduced ? 0 : 0.65, ease: EASE.secondary }}
            />
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Menu Overlay — negro pleno, identidad editorial (numeración + display) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.micro, ease: EASE.secondary }} // exit rápido ~0.18s
            className="fixed inset-0 z-[60] bg-black lg:hidden flex flex-col px-6 pt-24 pb-8 overflow-y-auto"
          >
            {/* Único botón de cierre — en el mismo lugar que las barras */}
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar menú"
              className="absolute top-0 right-[14px] h-[var(--nav-h)] min-w-[44px] flex items-center justify-center text-white"
            >
              <X size={24} strokeWidth={1.25} aria-hidden />
            </button>

            {/* Links: numeración mono + display grande, coreografía por item */}
            <motion.nav
              variants={menuContainer}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-y-5"
            >
              {MENU_ITEMS.map((item, i) => {
                const active =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <motion.div key={item.href} variants={menuItem} className="flex items-baseline gap-4">
                    <span
                      className={`font-mono text-xs tracking-[0.2em] tabular-nums pt-1 ${
                        active ? "text-white" : "text-white/30"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`font-display leading-[1.02] tracking-tight text-4xl ${
                        active ? "text-white font-semibold" : "text-white/60 font-normal"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>

            {/* Bloque contacto jerarquizado: WhatsApp dominante + secundarios.
                Anclado cerca de la lista (no mt-auto) para no dejar aire muerto al fondo. */}
            <motion.div variants={menuItem} initial="hidden" animate="visible" className="mt-14">
              <a
                href={waLink(WA_GENERIC_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 h-14 w-full bg-whatsapp text-black text-sm font-semibold uppercase tracking-[0.15em]"
              >
                <WhatsAppIcon className="w-5 h-5" />
                Escribir por WhatsApp
              </a>
              <div className="mt-5 flex items-center justify-between">
                <a
                  href={SITE.phoneHref}
                  className="flex items-center gap-2 text-white/60 text-xs uppercase tracking-[0.15em] min-h-[44px]"
                  aria-label="Llamar a Leonardo Guzman"
                >
                  <Phone className="w-4 h-4" strokeWidth={1.5} /> Llamar
                </a>
                <div className="flex items-center gap-5">
                  <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="text-white/60 min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Instagram de Leonardo Guzman">
                    <Instagram className="w-6 h-6" strokeWidth={1.5} />
                  </a>
                  <a href={SITE.facebook} target="_blank" rel="noopener noreferrer" className="text-white/60 min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Facebook de Leonardo Guzman">
                    <Facebook className="w-6 h-6" strokeWidth={1.5} />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
