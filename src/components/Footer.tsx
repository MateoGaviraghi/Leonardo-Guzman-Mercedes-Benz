"use client";

// Footer de todo el sitio · Telón (D-075; 2026-11-17). Referencia: Olivier Larose · Sticky Footer,
// elegida entre tres prototipos (Telón, Encendido, Gama). Mateo: «vamos con telón pero… que no
// diga Leonardo, que diga Mercedes-Benz, y pongas en algún lado el logo de Mercedes, y también
// mencione Automotores Mega y Leonardo… y que cuando pase el mouse haga alguna animación».
// - La sección de arriba sube como un telón y destapa el footer, que queda quieto (fijo, recortado
//   por su contenedor). En papel.
// - Abajo, la estrella y «Mercedes-Benz» de borde a borde en la serif del sitio; mientras se
//   destapa, terminan de subir. Arriba a la izquierda, Leonardo; abajo de esa columna, Mega.
// - Links: al pasar el mouse las letras ruedan hacia arriba una por una (sin subrayado: D-001).
// - Contacto: el botón verde «Escribime» y los logos 3D sin WhatsApp y con Google Maps (D-056).
// - El alto es el del contenido; si no entra en la pantalla (celulares bajos), va en el flujo
//   normal, sin destaparse (criterio: un footer que se destapa no mide más que la pantalla).
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { BotonCromo } from "@/components/ui/BotonCromo";
import { EstrellaMetal } from "@/components/nav/EstrellaMetal";
import { IconosContacto } from "@/components/ui/IconosContacto";
import { SITE, waLink, WA_GENERIC_MESSAGE } from "@/lib/site";
import { pegar } from "@/lib/texto";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const VEHICULOS = [
  { label: "Autos", href: "/#gama-autos" },
  { label: "SUVs", href: "/#gama-suv" },
  { label: "Vans", href: "/#gama-vans" },
  { label: "Sprinter", href: "/#gama-sprinter" },
  { label: "Trucks", href: "/#gama-camiones" },
];
const SERVICIOS = [
  { label: "Financiación", href: "/financiacion" },
  { label: "Plan de Ahorro", href: "/plan-ahorro" },
  { label: "Usados Seleccionados", href: "/usados" },
  { label: "Sobre mí", href: "/about" },
];

/** Las letras ruedan: la palabra sube letra por letra y entra la misma desde abajo. */
function Rueda({ texto }: { texto: string }) {
  const letras = [...texto];
  const capa = (abajo: boolean) => (
    <span aria-hidden className={`flex ${abajo ? "absolute inset-x-0 top-full" : ""}`}>
      {letras.map((l, i) => (
        <span
          key={i}
          className="inline-block whitespace-pre transition-transform duration-[650ms] ease-[var(--ease-primary)] group-hover/l:-translate-y-full group-focus-visible/l:-translate-y-full motion-reduce:transition-none"
          style={{ transitionDelay: `${i * 22}ms` }}
        >
          {l}
        </span>
      ))}
    </span>
  );
  return (
    <span className="relative inline-flex overflow-hidden leading-[1.25]">
      <span className="sr-only">{texto}</span>
      {capa(false)}
      {capa(true)}
    </span>
  );
}

const LINK =
  "group/l inline-flex min-h-11 min-w-11 items-center text-[15px] text-ink/80 transition-colors duration-500 hover:text-ink focus-visible:text-ink lg:min-h-9";

function Item({ href, texto, externo }: { href: string; texto: string; externo?: boolean }) {
  const clase = LINK;
  return (
    <li>
      {externo ? (
        <a href={href} className={clase}>
          <Rueda texto={texto} />
        </a>
      ) : (
        <Link href={href} className={clase}>
          <Rueda texto={texto} />
        </Link>
      )}
    </li>
  );
}

const EYEBROW = "text-eyebrow font-mono uppercase tracking-[0.18em] text-ink/80";

function Telon() {
  const caja = useRef<HTMLDivElement>(null);
  const pie = useRef<HTMLElement>(null);
  // si el contenido no entra en la pantalla (celulares bajos), el footer deja de destaparse y
  // va en el flujo normal: un footer que se destapa nunca puede ser más alto que la pantalla
  // el alto es el del contenido (sin aire de relleno): se mide y se usa en px
  const [alto, setAlto] = useState<number | null>(null);
  const fijo = alto !== null;
  useEffect(() => {
    const medir = () => {
      const f = pie.current;
      if (!f) return;
      // alto natural del contenido: se mide un instante en el flujo, sin alto fijo (sin pintar)
      f.style.position = "relative";
      f.style.height = "auto";
      const natural = f.offsetHeight;
      f.style.position = "";
      f.style.height = "";
      setAlto(natural <= window.innerHeight ? natural : null);
    };
    medir();
    document.fonts?.ready.then(medir);
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, []);
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [alto]);

  useGSAP(
    () => {
      if (!fijo || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const st = { trigger: caja.current, start: "top bottom", end: "bottom bottom", scrub: true };
      gsap.fromTo(".tl-marca", { yPercent: 40 }, { yPercent: 0, ease: "none", scrollTrigger: st });
      gsap.fromTo(".tl-arriba", { y: -60 }, { y: 0, ease: "none", scrollTrigger: { ...st } });
    },
    { scope: caja, dependencies: [alto], revertOnUpdate: true },
  );

  return (
    <div
      ref={caja}
      data-nav-theme="papel"
      className="relative mt-auto shrink-0"
      style={fijo ? { height: alto, clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" } : undefined}
    >
      <footer ref={pie} style={fijo ? { height: alto } : undefined} className={`flex w-full flex-col overflow-hidden bg-paper-0 text-ink ${fijo ? "fixed bottom-0 left-0" : "relative"}`}>
        <div className="tl-arriba flex flex-col px-6 pt-[calc(var(--nav-h)+0.75rem)] md:px-12 lg:pt-[calc(var(--nav-h)+clamp(0.75rem,3.5svh,3.5rem))]">
          <div className="grid grid-cols-2 gap-x-6 gap-y-[clamp(0.75rem,2.5svh,2rem)] lg:grid-cols-[1.3fr_1fr_1fr_1.3fr] lg:gap-x-10">
            {/* Leonardo y Automotores Mega SA */}
            {/* arriba Leonardo; abajo, alineado con el último link, dónde queda Mega (2026-11-17:
                el aire vacío debajo del nombre «está muy mal hecho») */}
            <div className="col-span-2 flex flex-col gap-2 lg:col-span-1 lg:justify-between">
              <div>
                <span className="block font-display text-[clamp(1.6rem,1rem+1.6vw,2.6rem)] leading-none tracking-[-0.01em]">Leonardo Guzmán</span>
                <span className="mt-2 block text-[13px] leading-snug text-ink/80 lg:mt-3">{pegar("Promotor de Ventas")}</span>
              </div>
              <address className="text-[13px] not-italic leading-relaxed text-ink/80 lg:pb-2">
                <span className="text-ink lg:block">Automotores Mega SA</span>
                <span className="lg:hidden"> · </span>
                <span className="lg:block">{pegar("Concesionario Oficial Mercedes-Benz")}</span>
                {/* en el celular la dirección va abajo, con el ©, para que el footer entre en la pantalla */}
                <span className="hidden lg:block">{pegar(SITE.address.line1)}</span>
                <span className="hidden lg:block">{pegar(SITE.address.line2)}</span>
              </address>
            </div>
            <nav aria-label="Vehículos">
              <h3 className={EYEBROW}>Vehículos</h3>
              <ul className="mt-2 lg:mt-4">
                {VEHICULOS.map((v) => (
                  <Item key={v.label} href={v.href} texto={v.label} />
                ))}
              </ul>
            </nav>
            <nav aria-label="Servicios">
              <h3 className={EYEBROW}>Servicios</h3>
              <ul className="mt-2 lg:mt-4">
                {SERVICIOS.map((v) => (
                  <Item key={v.label} href={v.href} texto={v.label} />
                ))}
              </ul>
            </nav>
            <div className="col-span-2 lg:col-span-1">
              <h3 className={EYEBROW}>Contacto</h3>
              <div className="mt-3 flex flex-wrap items-center gap-2 lg:mt-5">
                <BotonCromo href={waLink(WA_GENERIC_MESSAGE)} externo tono="verde">
                  <span className="flex items-center gap-2.5">
                    <WhatsAppIcon className="h-4 w-4" />
                    Escribime
                  </span>
                </BotonCromo>
              </div>
              {/* los logos oficiales en 3D (D-056); sin WhatsApp, que ya está en el botón, y con Google Maps */}
              <IconosContacto logos={["instagram", "telefono", "gmail", "maps"]} className="-ml-1.5 mt-2 gap-2" />
              <ul className="mt-1 lg:mt-2">
                <li className="hidden lg:block">
                  <a href={SITE.phoneHref} className={`${LINK} tabular-nums`}>
                    <Rueda texto={SITE.phoneDisplay} />
                  </a>
                </li>
                <li className="hidden lg:block">
                  <a href={`mailto:${SITE.email}`} className={LINK}>
                    <Rueda texto={SITE.email} />
                  </a>
                </li>
                <Item href="/contact" texto="Formulario de consulta" />
              </ul>
            </div>
          </div>

          <div className="mt-6 flex flex-col lg:mt-[clamp(1.75rem,6svh,4.5rem)] gap-1 pb-3 text-[12px] leading-relaxed text-ink/80 lg:flex-row lg:items-end lg:justify-between lg:pb-4">
            <p className="lg:hidden">{pegar(`${SITE.address.line1} · ${SITE.address.line2}`)}</p>
            <p>{pegar(`© ${new Date().getFullYear()} Automotores Mega SA · Leonardo Guzmán`)}</p>
          </div>
        </div>

        {/* la estrella y «Mercedes-Benz» de borde a borde, alineados con los márgenes del resto:
            ancho de la marca = 5,62 veces su tamaño (estrella 0,7 + aire 0,09 + palabra 4,83 en
            Instrument Serif); lo que sobre por redondeo lo absorbe el espacio entre los dos */}
        <div className="overflow-hidden px-6 md:px-12">
          <span className="block [container-type:inline-size]">
            <span className="tl-marca flex items-center justify-between gap-[0.09em] whitespace-nowrap pb-[0.1em] font-display text-[calc(100cqw/5.66)] leading-[0.86] tracking-[-0.02em]">
              <EstrellaMetal className="h-[0.7em] w-[0.7em] shrink-0 -translate-y-[0.01em]" />
              <span>Mercedes‑Benz</span>
            </span>
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/crm") || pathname.startsWith("/admin")) return null;
  return <Telon />;
}
