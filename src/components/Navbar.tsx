"use client";

import { flushSync } from "react-dom";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { SITE, waLink, WA_GENERIC_MESSAGE } from "@/lib/site";
import { EASE } from "@/lib/motion-tokens";
import { EstrellaMetal } from "@/components/nav/EstrellaMetal";
import { BotonCromo } from "@/components/ui/BotonCromo";
import { IconosContacto } from "@/components/ui/IconosContacto";
import { GrillaModelos, PanelVehiculos } from "@/components/nav/MenuVehiculos";

gsap.registerPlugin(useGSAP);

// Header (rediseño 2026-11-10, Mateo: «Header 2, logo, botón A»).
// Escritorio: estrella de metal líquido + nombre · secciones · «Consultar» en cromo.
// «Vehículos» abre un panel con toda la gama en fotos (referencia: genesis.com).
// Celular: estrella · Consultar · menú; el menú baja como cortina y «Vehículos»
// entra a una segunda pantalla con las pestañas y los autos.

/** Secciones (chrome-global §2.4). «Vehículos» abre el panel; el resto son links. */
const NAV_LINKS = [
  { label: "Usados", href: "/usados" },
  { label: "Financiación", href: "/financiacion" },
  { label: "Plan de Ahorro", href: "/plan-ahorro" },
  { label: "Sobre mí", href: "/about" },
  { label: "Contacto", href: "/contact" },
] as const;

const WA = waLink(WA_GENERIC_MESSAGE);

/** Texto que sube y se reemplaza al pasar el mouse (link vivo, sin subrayado). */
function TextoRodante({ children }: { children: string }) {
  return (
    <span className="relative block overflow-hidden">
      <span className="block transition-transform duration-[700ms] ease-[var(--ease-primary)] group-hover:-translate-y-full">{children}</span>
      <span aria-hidden className="absolute inset-0 translate-y-full transition-transform duration-[700ms] ease-[var(--ease-primary)] group-hover:translate-y-0">
        {children}
      </span>
    </span>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const hideOnRoutes = pathname.startsWith("/crm") || pathname.startsWith("/admin");

  const [isOpen, setIsOpen] = useState(false); // menú del celular
  const [vista, setVista] = useState<"menu" | "vehiculos">("menu");
  const [panel, setPanel] = useState(false); // panel de Vehículos (escritorio)
  const [scrolled, setScrolled] = useState(false);
  const [paper, setPaper] = useState(false);
  const [paperColor, setPaperColor] = useState<string | null>(null);
  const [paperResetPathname, setPaperResetPathname] = useState(pathname);
  if (paperResetPathname !== pathname) {
    setPaperResetPathname(pathname);
    if (!hideOnRoutes) setPaper(false);
    setPanel(false);
  }
  const [amg, setAmg] = useState(
    () => typeof document !== "undefined" && document.documentElement.hasAttribute("data-amg")
  );
  const reduced = useReducedMotion();

  const triggerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const abrirT = useRef<number | undefined>(undefined);
  const cerrarT = useRef<number | undefined>(undefined);
  const abiertoPorMouse = useRef(-Infinity);
  const tlMenu = useRef<gsap.core.Timeline | null>(null);
  // Lo que pidió el usuario (abrir/cerrar), aunque la animación no haya terminado:
  // isOpen recién pasa a false al final del cierre y el botón tocaba «cerrar» dos veces.
  const menuPedido = useRef(false);

  // Celular: se esconde al bajar y vuelve apenas se sube (ref. Polestar).
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

  // Tema dual cine/papel según la sección que está debajo del header.
  useEffect(() => {
    if (hideOnRoutes) return;
    let observer: IntersectionObserver | null = null;
    const intersecting = new Set<Element>();
    const attach = () => {
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
          const first = intersecting.values().next().value as Element | undefined;
          if (first) {
            const bg = getComputedStyle(first).backgroundColor;
            if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") setPaperColor(bg);
          }
        },
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

  // Modo AMG (atributo en <html> que setea VehiclesClient).
  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => setAmg(root.hasAttribute("data-amg")));
    observer.observe(root, { attributes: true, attributeFilter: ["data-amg"] });
    return () => observer.disconnect();
  }, []);

  // Escape cierra el panel de Vehículos.
  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPanel(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [panel]);

  // Scroll trabado mientras está abierto el menú del celular.
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


  // Menú del celular: cortina 1,0 s power3.inOut y links cada 0,07 s (patrón aprobado en Sanalys).
  const { contextSafe } = useGSAP(() => {
    gsap.set(overlayRef.current, { yPercent: -101, visibility: "hidden" });
  });
  const abrirMenu = () =>
    contextSafe(() => {
      const r = !!reduced;
      setVista("menu");
      setIsOpen(true);
      // Mismo criterio que el panel de escritorio: la orden nueva mata a la anterior, si no
      // el cierre que seguía corriendo escondía el menú recién abierto.
      menuPedido.current = true;
      tlMenu.current?.kill();
      tlMenu.current = gsap
        .timeline()
        .set(overlayRef.current, { visibility: "visible" })
        .to(overlayRef.current, { yPercent: 0, duration: r ? 0 : 1.0, ease: "power3.inOut" })
        .fromTo(".mm-link > span", { yPercent: 110 }, { yPercent: 0, duration: r ? 0 : 1.0, ease: "expo.out", stagger: 0.07 }, r ? 0 : 0.45)
        .fromTo(".mm-pie", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: r ? 0 : 0.8, ease: "power3.out" }, r ? 0 : 0.85);
    })();
  const cerrarMenu = () =>
    contextSafe(() => {
      const r = !!reduced;
      menuPedido.current = false;
      tlMenu.current?.kill();
      tlMenu.current = gsap
        .timeline({ onComplete: () => { setIsOpen(false); gsap.set(overlayRef.current, { visibility: "hidden" }); } })
        .to(overlayRef.current, { yPercent: -101, duration: r ? 0 : 0.85, ease: "power3.inOut" });
    })();
  const irAVehiculos = () =>
    contextSafe(() => {
      // flushSync: la pantalla de Vehículos tiene que existir antes de animarla (si no,
      // GSAP no la encontraba —«target .mm-vehiculos not found»— y aparecía de golpe).
      flushSync(() => setVista("vehiculos"));
      if (!reduced) gsap.fromTo(".mm-vehiculos", { xPercent: 100 }, { xPercent: 0, duration: 0.9, ease: "expo.inOut" });
    })();
  const volverAlMenu = () =>
    contextSafe(() => {
      if (reduced) return setVista("menu");
      gsap.to(".mm-vehiculos", { xPercent: 100, duration: 0.7, ease: "power3.inOut", onComplete: () => setVista("menu") });
    })();

  // Foco dentro del menú del celular + Escape + foco de vuelta al botón.
  useEffect(() => {
    if (!isOpen) return;
    const overlay = overlayRef.current;
    if (!overlay) return;
    const trigger = triggerRef.current;
    const focusables = () =>
      Array.from(overlay.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(
        (el) => el.offsetParent !== null
      );
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return cerrarMenu();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Panel de escritorio: abre al pasar el mouse (con 120 ms de intención) o con clic.
  const pedirPanel = () => {
    window.clearTimeout(cerrarT.current);
    abrirT.current = window.setTimeout(() => {
      abiertoPorMouse.current = performance.now();
      setPanel(true);
    }, 120);
  };
  // El clic sobre «Vehículos» llega justo después de que el mouse ya lo abrió: si se
  // invertía, lo cerraba en la cara del usuario. Dentro del primer segundo, el clic abre.
  const clicPanel = () => {
    window.clearTimeout(abrirT.current);
    window.clearTimeout(cerrarT.current);
    const recien = performance.now() - abiertoPorMouse.current < 1000;
    setPanel((v) => (v && !recien ? false : true));
  };
  const soltarPanel = () => {
    window.clearTimeout(abrirT.current);
    cerrarT.current = window.setTimeout(() => setPanel(false), 220);
  };

  if (hideOnRoutes) return null;

  // Con el panel abierto el header queda oscuro, como el panel (Mateo: con el header
  // claro «se pierde la imagen del logo»).
  const claro = paper && !panel;
  const textStrong = claro ? "text-ink" : "text-white";
  const textMuted = claro ? "text-ink-60" : "text-white/55";
  const scrolledBg = claro
    ? "bg-[var(--nav-paper)] lg:bg-paper-0/90 lg:backdrop-blur-2xl lg:backdrop-saturate-150"
    : "bg-black lg:bg-black/55 lg:backdrop-blur-2xl lg:backdrop-saturate-150";
  const fondo = isOpen ? "bg-transparent" : panel ? "bg-[#0b0b0d]" : scrolled ? scrolledBg : "bg-transparent";
  const vehiculosActivo = pathname.startsWith("/vehicles");

  return (
    <>
      <nav
        onMouseLeave={soltarPanel}
        onMouseEnter={() => panel && window.clearTimeout(cerrarT.current)}
        className={`fixed top-0 left-0 right-0 ${isOpen ? "z-[70]" : "z-50"} h-[var(--nav-h)] flex items-center transition-[background-color,transform] duration-[550ms] ease-[var(--ease-secondary)] motion-reduce:transition-none ${fondo} ${
          navHidden && !isOpen ? "max-lg:-translate-y-full" : "translate-y-0"
        }`}
        style={{ "--nav-paper": paperColor ?? "var(--color-paper-0)" } as React.CSSProperties}
      >
        <div className="w-full px-6 md:px-12 lg:px-8 xl:px-12">
          {/* Escritorio */}
          <div className="hidden lg:grid lg:grid-cols-[auto_1fr_auto] items-center gap-6 xl:gap-10">
            <Link href="/" className="flex shrink-0 items-center gap-4 whitespace-nowrap" aria-label={`${SITE.name}, inicio`}>
              <EstrellaMetal className="h-12 w-12" />
              <span className="flex flex-col">
                <span className="flex items-baseline gap-2">
                  <span className={`text-[15px] font-medium uppercase leading-none tracking-[0.08em] transition-colors duration-500 ${textStrong}`}>{SITE.name}</span>
                  <AnimatePresence>
                    {amg && (
                      <motion.span
                        key="amg-suffix-desktop"
                        aria-hidden="true"
                        className="font-sans text-[11px] font-medium tracking-[0.3em] leading-none uppercase text-[#5AC3B6]"
                        initial={{ clipPath: reduced ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
                        animate={{ clipPath: "inset(0 0% 0 0)" }}
                        exit={{ clipPath: "inset(0 100% 0 0)", transition: { duration: reduced ? 0 : 0.2, ease: EASE.secondary } }}
                        transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : 0.2, ease: EASE.secondary }}
                      >
                        / AMG
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
                <span className={`mt-1.5 text-[11px] font-medium uppercase leading-none tracking-[0.22em] transition-colors duration-500 ${textMuted}`}>
                  {SITE.dealerShort}
                </span>
              </span>
            </Link>

            <div className="flex items-center justify-center gap-4 xl:gap-10">
              <button
                type="button"
                onMouseEnter={pedirPanel}
                onClick={clicPanel}
                aria-expanded={panel}
                aria-controls="panel-vehiculos"
                className={`group flex items-center gap-1.5 text-[12px] font-medium xl:text-[13px] uppercase tracking-[0.1em] transition-colors duration-500 xl:tracking-[0.14em] ${
                  claro ? "" : "[text-shadow:0_1px_10px_rgba(0,0,0,0.65)]"
                } ${
                  panel || vehiculosActivo ? textStrong : claro ? "text-ink-60 hover:text-ink" : "text-white/90 hover:text-white"
                }`}
              >
                <TextoRodante>Vehículos</TextoRodante>
                <ChevronDown size={14} className={`transition-transform duration-700 ease-[var(--ease-primary)] ${panel ? "rotate-180" : ""}`} />
              </button>
              {NAV_LINKS.map((link) => {
                const active = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onMouseEnter={soltarPanel}
                    aria-current={active ? "page" : undefined}
                    className={`group whitespace-nowrap text-[12px] font-medium xl:text-[13px] uppercase tracking-[0.1em] transition-colors duration-500 xl:tracking-[0.14em] ${
                      claro ? "" : "[text-shadow:0_1px_10px_rgba(0,0,0,0.65)]"
                    } ${
                      active ? textStrong : claro ? "text-ink-60 hover:text-ink" : `text-white/90 ${amg ? "hover:text-[#5AC3B6]" : "hover:text-white"}`
                    }`}
                  >
                    <TextoRodante>{link.label}</TextoRodante>
                  </Link>
                );
              })}
            </div>

            <div className="shrink-0">
              <BotonCromo href={WA} externo>Consultar</BotonCromo>
            </div>
          </div>

          {/* Celular: estrella · Consultar · menú (D-037: sin nombre, sin «MENÚ» en texto) */}
          <div className="lg:hidden grid grid-cols-[1fr_auto_1fr] items-center">
            <Link href="/" aria-label={`Inicio — ${SITE.name}`} className="justify-self-start">
              <EstrellaMetal className="h-10 w-10" />
            </Link>
            <BotonCromo href={WA} externo className="h-10 px-5">Consultar</BotonCromo>
            <button
              ref={triggerRef}
              onClick={() => (menuPedido.current ? cerrarMenu() : abrirMenu())}
              aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              className={`relative justify-self-end -mr-2 h-11 w-11 transition-colors duration-[550ms] ${isOpen ? "text-white" : textStrong}`}
            >
              <span className={`absolute left-1/2 top-1/2 h-[1.5px] w-6 -translate-x-1/2 bg-current transition-transform duration-700 ease-[var(--ease-primary)] ${isOpen ? "rotate-45" : "-translate-y-[4px]"}`} />
              <span className={`absolute left-1/2 top-1/2 h-[1.5px] w-6 -translate-x-1/2 bg-current transition-transform duration-700 ease-[var(--ease-primary)] ${isOpen ? "-rotate-45" : "translate-y-[4px]"}`} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {amg && !panel && (
            <motion.span
              key="amg-hairline"
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-0 right-0 h-[1px] bg-[#5AC3B6]/40"
              initial={{ scaleX: reduced ? 1 : 0, transformOrigin: "left center" }}
              animate={{ scaleX: 1, transformOrigin: "left center" }}
              exit={{ scaleX: 0, transformOrigin: "right center", transition: { duration: reduced ? 0 : 0.35, ease: EASE.secondary } }}
              transition={{ duration: reduced ? 0 : 0.65, ease: EASE.secondary }}
            />
          )}
        </AnimatePresence>

        <PanelVehiculos abierto={panel} onCerrar={() => setPanel(false)} />
      </nav>

      {/* Velo detrás del panel de escritorio */}
      <div
        aria-hidden
        onClick={() => setPanel(false)}
        className={`fixed inset-0 z-40 hidden bg-black/45 transition-opacity duration-700 lg:block ${panel ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      {/* Menú del celular: baja como cortina */}
      <div
        id="mobile-menu"
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        aria-hidden={!isOpen}
        data-lenis-prevent
        className="fixed inset-0 z-[60] overflow-hidden bg-black text-white lg:hidden"
      >
        <div className="flex h-full flex-col overflow-y-auto px-6 pb-8 pt-24">
          <nav className="flex flex-col gap-y-3">
            <button type="button" onClick={irAVehiculos} className="mm-link group flex items-center justify-between overflow-hidden text-left">
              <span className="block font-display text-[2.6rem] leading-[1.05]">Vehículos</span>
              <span className="text-white/40">›</span>
            </button>
            {[{ label: "Inicio", href: "/" }, ...NAV_LINKS].map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={cerrarMenu}
                  aria-current={active ? "page" : undefined}
                  className="mm-link block overflow-hidden"
                >
                  <span className={`block font-display text-[2.6rem] leading-[1.05] ${active ? "text-white" : "text-white/60"}`}>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Contacto: solo los íconos (Mateo: sacar «Escribir por WhatsApp») */}
          <div className="mm-pie mt-12">
            <IconosContacto />
          </div>
        </div>

        {/* Segunda pantalla: la gama en fotos */}
        {vista === "vehiculos" && (
          <div className="mm-vehiculos absolute inset-0 overflow-y-auto bg-[#0b0b0d] px-5 pb-10 pt-20 text-white">
            <button type="button" onClick={volverAlMenu} className="mb-5 flex min-h-[44px] items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em]">
              <ArrowLeft size={16} /> Menú
            </button>
            <p className="mb-5 font-display text-[2.4rem] leading-none">Vehículos</p>
            <GrillaModelos onElegir={cerrarMenu} columnas="grid-cols-2" entrar={1} />
          </div>
        )}
      </div>
    </>
  );
}
