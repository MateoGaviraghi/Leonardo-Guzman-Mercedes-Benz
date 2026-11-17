"use client";

// «La gama» del inicio (D-065, 2026-11-11). Mateo eligió el prototipo «Anillo»
// (referencia: Codrops «On-Scroll 3D Carousel») después de dos rondas:
//   «vamos a ir por anillo, lo único es que si tocás en un auto te lleve al vehículo».
// Ronda 3 (mismo día): «cuando hago el scroll todo debería entrar con GSAP, motion
// fluido… que la gente diga wow… si paso de autos a SUV no hace nada… tené en cuenta el
// scroll en mobile, controlado y fluido, ni lento ni rápido».
//
// Cómo funciona:
// - La sección ocupa una pantalla, queda quieta (pin) mientras bajás y el anillo gira
//   atado al scroll, sin snap ni tope. El largo del giro depende de cuántos modelos tiene la
//   pestaña (largoGiro: 35 % de pantalla por modelo, mínimo 70 %). Mateo: «en Vans son dos
//   autos y estoy dos horas para llegar al otro». Al cambiar de pestaña el scroll vuelve al
//   comienzo del pin y el largo se recalcula (sin salto: la sección está quieta). Antes era
//   fijo (240 %) para todas las pestañas.
// - Entrada (al asomar la sección, top 75 %, con los recortes ya decodificados): el título
//   sube por renglón (antes letra por letra; cambiado el 2026-11-12 para el celular); la línea de
//   las pestañas se dibuja de izquierda a derecha y las pestañas suben; el anillo llega
//   girando desde el fondo (1,6 s expo.out); la barra de abajo entra al final.
// - Cambio de pestaña: el anillo se va girando hacia el fondo (0,55 s power3.in), cambian
//   los modelos y el nuevo entra girando desde el otro lado (1,3 s expo.out).
//   La palabra gigante de la categoría detrás del anillo se probó y se sacó (Mateo:
//   «sacale lo de auto de fondo»).
// - Tocar cualquier auto abre su ficha. Las flechas llevan el scroll al modelo anterior
//   o siguiente.
// - Celular: scroll nativo (Lenis solo corre en ≥ 1024 px); scrub 0,9 para que el giro
//   acompañe el dedo sin saltos; `ignoreMobileResize` evita que el pin salte cuando se
//   esconde la barra del navegador.
// - Orden en tres franjas (ronda 2): arriba «La gama» + título y «Ver todos los modelos»
//   (link del hero), pestañas debajo; al centro el anillo; abajo nombre + combustible,
//   flechas con «02 / 08» y «Ver modelo» (BotonCromo, D-054).
// - Recortes de `menu-modelos.ts` (900 px de ancho): en pantalla, a lo sumo 640 px.
// - Sin catálogo (2026-11-17, Mateo: «eliminar la página de vehículos, no tiene mucho sentido
//   con lo que hicimos en el header»): la gama es el lugar de «ver todos». Se llega con
//   `/#gama` o `/#gama-<pestaña>` (hero, «Ver todos» del menú, footer, ficha, links viejos
//   de /vehicles): baja al comienzo de la sección y abre esa pestaña. Sale «Ver todos los modelos».
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { BotonCromo } from "@/components/ui/BotonCromo";
import { MODELOS_MENU, PESTANAS, type ModeloMenu, type PestanaMenu } from "@/lib/vehicles/menu-modelos";
import { pegar } from "@/lib/texto";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);
if (typeof window !== "undefined") ScrollTrigger.config({ ignoreMobileResize: true });

/** Cuánto se agranda el recorte por pestaña (ver la geometría del anillo). */
const AGRANDAR: Partial<Record<PestanaMenu, number>> = { vans: 1.25, sprinter: 1.45, camiones: 1.6 };

/** Largo del giro en % de la pantalla: 35 % por modelo, mínimo 70 %. */
const largoGiro = (n: number) => Math.max((n - 1) * 35, 70);
/** Ángulo máximo entre el primer y el último modelo: así el primero nunca vuelve a
 *  asomar del otro lado cuando llegás al final (Mateo, en Mercedes-AMG: «cuando se
 *  termina vuelven a aparecer los otros… ninguno de los otros lo hace»). */
const ARCO_MAX = 260;

const reducido = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const modelosDe = (p: PestanaMenu) => MODELOS_MENU.filter((m) => m.pestana === p);

function Pestanas({ pestana, onCambiar }: { pestana: PestanaMenu; onCambiar: (p: PestanaMenu) => void }) {
  const lista = useRef<HTMLDivElement>(null);
  const luz = useRef<HTMLSpanElement>(null);
  const primera = useRef(true);

  useGSAP(
    () => {
      const ubicar = (animar: boolean) => {
        const btn = lista.current?.querySelector<HTMLElement>(`[data-pestana="${pestana}"]`);
        if (!btn || !luz.current || btn.offsetWidth === 0) return;
        const destino = { x: btn.offsetLeft, y: btn.offsetTop + btn.offsetHeight - 1, width: btn.offsetWidth, opacity: 1 };
        gsap.killTweensOf(luz.current);
        if (!animar || reducido()) gsap.set(luz.current, destino);
        else gsap.to(luz.current, { ...destino, duration: 0.8, ease: "expo.inOut" });
      };
      ubicar(!primera.current);
      primera.current = false;
      const ro = new ResizeObserver(() => ubicar(false));
      if (lista.current) ro.observe(lista.current);
      return () => ro.disconnect();
    },
    { dependencies: [pestana] },
  );

  return (
    <div
      ref={lista}
      role="tablist"
      aria-label="Categorías de vehículos"
      className="relative mx-auto grid w-full max-w-md grid-cols-3 lg:mx-0 lg:flex lg:w-full lg:max-w-none lg:justify-start"
    >
      <span aria-hidden className="gm-linea pointer-events-none absolute inset-x-0 top-1/2 h-px origin-left -translate-y-px bg-white/[0.12] lg:hidden" />
      <span aria-hidden className="gm-linea pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left bg-white/[0.12]" />
      <span
        ref={luz}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-px w-0 bg-white opacity-0 shadow-[0_0_12px_1px_rgba(255,255,255,0.55)]"
      />
      {PESTANAS.map((t) => {
        const activa = t.id === pestana;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            data-pestana={t.id}
            aria-selected={activa}
            onClick={() => onCambiar(t.id)}
            className={`gm-pestana relative shrink-0 px-2 py-3.5 text-[10px] font-medium uppercase tracking-[0.18em] transition-colors duration-700 ease-[var(--ease-primary)] lg:px-6 lg:py-3.5 lg:text-[11px] lg:tracking-[0.24em] ${
              activa ? "text-white" : "text-white/45 hover:text-white/85"
            }`}
          >
            {t.corto ? (
              <>
                <span className="lg:hidden">{t.corto}</span>
                <span className="hidden lg:inline">{t.nombre}</span>
              </>
            ) : (
              t.nombre
            )}
          </button>
        );
      })}
    </div>
  );
}

function Flecha({ lado, onClick, disabled }: { lado: "atras" | "adelante"; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-label={lado === "atras" ? "Modelo anterior" : "Modelo siguiente"}
      onClick={onClick}
      disabled={disabled}
      className="group grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/[0.07] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-sm transition-[background-color,color,transform] duration-[600ms] ease-[var(--ease-primary)] hover:bg-white hover:text-black active:scale-95 disabled:pointer-events-none disabled:opacity-25"
    >
      {lado === "atras" ? (
        <ArrowLeft size={17} className="transition-transform duration-[600ms] ease-[var(--ease-primary)] group-hover:-translate-x-0.5" />
      ) : (
        <ArrowRight size={17} className="transition-transform duration-[600ms] ease-[var(--ease-primary)] group-hover:translate-x-0.5" />
      )}
    </button>
  );
}

function Barra({
  modelo,
  indice,
  total,
  onAtras,
  onAdelante,
}: {
  modelo: ModeloMenu;
  indice: number;
  total: number;
  onAtras: () => void;
  onAdelante: () => void;
}) {
  const raiz = useRef<HTMLDivElement>(null);
  const primera = useRef(true);
  // el nombre nuevo sube desde abajo (persiana) cada vez que cambia el auto del frente
  useGSAP(
    () => {
      if (primera.current) return void (primera.current = false); // la entrada la hace la sección
      if (reducido()) return;
      gsap.fromTo(".gm-nombre", { yPercent: 105 }, { yPercent: 0, duration: 0.9, ease: "expo.out" });
      gsap.fromTo(".gm-dato", { autoAlpha: 0, x: -8 }, { autoAlpha: 1, x: 0, duration: 0.8, delay: 0.12, ease: "power3.out" });
    },
    { scope: raiz, dependencies: [modelo.nombre] },
  );
  const n2 = (x: number) => String(x).padStart(2, "0");

  return (
    <div ref={raiz} className="grid items-center gap-y-5 lg:grid-cols-[1fr_auto_1fr] lg:gap-x-10">
      <div className="gm-barra text-center lg:text-left">
        <div className="overflow-hidden pb-[0.1em]">
          <h3 className="gm-nombre text-balance font-display text-[clamp(1.7rem,7vw,2.2rem)] leading-[1.05] tracking-[-0.01em] text-white lg:text-[clamp(2rem,2.6vw,3rem)]">
            {pegar(modelo.nombre)}
          </h3>
        </div>
        <p className="gm-dato mt-2 flex items-center justify-center gap-3 lg:justify-start">
          <span aria-hidden className="h-px w-5 bg-white/35" />
          <span className="font-subtitulo text-[10px] font-medium uppercase tracking-[0.28em] text-white/60">{modelo.combustible}</span>
        </p>
      </div>

      <div className="gm-barra hidden items-center gap-5 lg:flex">
        <Flecha lado="atras" onClick={onAtras} disabled={indice === 0} />
        <span className="min-w-[4.5rem] text-center font-mono text-[11px] tracking-[0.2em] text-white/55">
          <span className="text-white">{n2(indice + 1)}</span> / {n2(total)}
        </span>
        <Flecha lado="adelante" onClick={onAdelante} disabled={indice >= total - 1} />
      </div>

      {/* «Ver modelo»: compu a la derecha (lejos del botón de WhatsApp); teléfono entre las flechas */}
      <div className="gm-barra flex items-center justify-between gap-4 lg:justify-end lg:pr-14">
        <span className="lg:hidden">
          <Flecha lado="atras" onClick={onAtras} disabled={indice === 0} />
        </span>
        <BotonCromo href={modelo.href}>
          <span className="inline-flex items-center gap-2.5">
            Ver modelo <ArrowRight size={14} />
          </span>
        </BotonCromo>
        <span className="lg:hidden">
          <Flecha lado="adelante" onClick={onAdelante} disabled={indice >= total - 1} />
        </span>
      </div>
    </div>
  );
}

export default function GamaAnillo() {
  // `pestana` = la elegida (la luz se mueve al instante); `vista` = la que muestra el
  // anillo (cambia cuando termina la salida del anillo anterior).
  const [pestana, setPestana] = useState<PestanaMenu>("autos");
  const [vista, setVista] = useState<PestanaMenu>("autos");
  const modelos = modelosDe(vista);
  const n = modelos.length;
  const [frente, setFrente] = useState(0);

  const seccion = useRef<HTMLElement>(null);
  const escena = useRef<HTMLDivElement>(null);
  const entrada = useRef<HTMLDivElement>(null); // envoltorio: entradas y salidas del anillo
  const anillo = useRef<HTMLDivElement>(null); // gira con el scroll
  const autos = useRef<(HTMLAnchorElement | null)[]>([]);
  const disparador = useRef<ScrollTrigger | null>(null);
  const progreso = useRef({ p: 0 });
  const geo = useRef({ n: 1, paso: 40, radio: 400, frente: 0 });
  const pintarRef = useRef<() => void>(() => {});
  const yaEntro = useRef(false);

  // ── Pinta el anillo según el progreso del scroll (lee la geometría vigente) ──
  const pintar = () => {
    const { n: total, paso, radio } = geo.current;
    const giro = progreso.current.p * (total - 1) * paso;
    gsap.set(anillo.current, { z: -radio, rotationY: -giro });
    autos.current.forEach((el, i) => {
      if (!el) return;
      let a = (i * paso - giro) % 360;
      if (a > 180) a -= 360;
      if (a < -180) a += 360;
      const aa = Math.abs(a);
      gsap.set(el, { autoAlpha: aa > 95 ? 0 : 1, filter: `brightness(${Math.max(1 - aa / 60, 0.2)})` });
    });
    const f = Math.min(Math.max(Math.round(progreso.current.p * (total - 1)), 0), total - 1);
    if (f !== geo.current.frente) {
      geo.current.frente = f;
      setFrente(f);
    }
  };
  const cambiarRef = useRef<(p: PestanaMenu) => void>(() => {});
  useEffect(() => {
    pintarRef.current = pintar;
  });

  // ── Llegar desde un link: /#gama o /#gama-<pestaña> ──
  useEffect(() => {
    const llegar = (hash: string) => {
      const m = /^#gama(?:-([a-z]+))?$/.exec(hash);
      if (!m) return false;
      const tab = PESTANAS.find((t) => t.id === m[1])?.id;
      const bajar = () => {
        const st = disparador.current;
        const y = st ? st.start : seccion.current!.getBoundingClientRect().top + window.scrollY;
        const lenis = (window as Window & { __lenis?: { scrollTo: (y: number, o?: { immediate?: boolean; force?: boolean }) => void } }).__lenis;
        if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
        else window.scrollTo(0, y);
        ScrollTrigger.update();
        if (tab) cambiarRef.current(tab);
      };
      requestAnimationFrame(() => requestAnimationFrame(bajar));
      return true;
    };
    llegar(window.location.hash);
    // en el inicio, un link a /#gama… no navega: baja y cambia la pestaña acá mismo
    const alClic = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const u = new URL(a.href, window.location.href);
      if (u.origin !== window.location.origin || u.pathname !== "/" || window.location.pathname !== "/") return;
      if (!u.hash.startsWith("#gama")) return;
      e.preventDefault();
      history.pushState(null, "", u.hash);
      llegar(u.hash);
    };
    const alHash = () => llegar(window.location.hash);
    document.addEventListener("click", alClic, true);
    window.addEventListener("hashchange", alHash);
    return () => {
      document.removeEventListener("click", alClic, true);
      window.removeEventListener("hashchange", alHash);
    };
  }, []);

  // ── Geometría del anillo para los modelos visibles ──
  useGSAP(
    () => {
      const ancho = escena.current?.offsetWidth ?? window.innerWidth;
      const alto = escena.current?.offsetHeight ?? 400;
      const movil = ancho < 768;
      // Todos los recortes tienen el vehículo a la misma altura (320 de 420 px), así que los
      // altos y cortos (vans, Sprinter, camiones) se veían chicos al lado de los autos
      // (Mateo: «vans, Sprinter y camiones quedaron muy chicos»). Se agrandan según el ancho
      // real del vehículo en el recorte (autos ≈ 720 px; Vito ≈ 580; Sprinter ≈ 490;
      // camiones ≈ 410), sin pasar el alto de la escena ni los 860 px (el archivo tiene 900).
      const base = Math.min(alto * 0.72 * (900 / 420), ancho * (movil ? 0.86 : 0.46), 640);
      const auto = Math.min(
        base * (AGRANDAR[vista] ?? 1),
        alto * 0.95 * (900 / 420),
        movil ? ancho * 1.25 : 860,
      );
      const paso = Math.min(40, ARCO_MAX / Math.max(n - 1, 1));
      const radio = (auto / 2 + (movil ? 10 : 40)) / Math.tan((paso * Math.PI) / 360);
      autos.current.length = n;
      geo.current = { n, paso, radio, frente: -1 };
      autos.current.forEach((el, i) => {
        if (!el) return;
        el.style.width = `${auto}px`;
        // primero gira, después se aleja: así cada auto queda sobre el anillo
        el.style.transform = `translate(-50%, -26%) rotateY(${i * paso}deg) translateZ(${radio}px)`;
      });
      pintar();
      // el largo del pin depende de la cantidad de modelos: recalcularlo
      if (yaEntro.current) ScrollTrigger.refresh();
      // cambio de pestaña: el anillo nuevo entra girando desde el otro lado
      if (yaEntro.current && !reducido()) {
        gsap.fromTo(entrada.current, { rotationY: 55, z: -520 }, { rotationY: 0, z: 0, duration: 1.3, ease: "expo.out" });
        gsap.fromTo(escena.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9, ease: "power2.out" });
      }
    },
    { scope: seccion, dependencies: [vista] },
  );

  // ── Pin + giro atado al scroll (uno solo, no se rehace al cambiar de pestaña) ──
  //    y la entrada de la sección cuando asoma.
  useGSAP(
    () => {
      const sinMovimiento = reducido();
      const tactil = window.matchMedia("(pointer: coarse)").matches;
      if (!sinMovimiento) {
        const t = gsap.to(progreso.current, {
          p: 1,
          ease: "none",
          onUpdate: () => pintarRef.current(),
          scrollTrigger: {
            trigger: seccion.current,
            start: "top top",
            end: () => `+=${largoGiro(geo.current.n)}%`,
            invalidateOnRefresh: true,
            scrub: tactil ? 0.9 : 0.6,
            pin: true,
            anticipatePin: 1,
          },
        });
        disparador.current = t.scrollTrigger ?? null;
      }

      if (sinMovimiento) {
        yaEntro.current = true;
        return;
      }

      // Estados iniciales (solo con JS: sin JS, todo queda visible)
      const titulo = seccion.current!.querySelector("h2")!;
      gsap.set([".gm-eyebrow", ".gm-pestana", ".gm-barra"], { autoAlpha: 0, y: 18 });
      gsap.set(".gm-linea", { scaleX: 0 });
      // (la opacidad va en `escena`: en un elemento con preserve-3d aplanaría el anillo)
      // celular: llegada más corta y menos profunda (2026-11-12, Mateo: «tanto en esta
      // sección como en la anterior entran muy tildadas»): -700 de profundidad con 8
      // recortes en 3D es lo más pesado de la entrada para la placa de un teléfono
      const chico = window.matchMedia("(max-width: 1023px)").matches;
      gsap.set(entrada.current, chico ? { rotationY: -32, z: -240 } : { rotationY: -70, z: -700 });
      gsap.set(escena.current, { autoAlpha: 0 });
      gsap.set(".gm-piso", { autoAlpha: 0, scale: 0.6 });
      gsap.set(titulo, { autoAlpha: 0 });

      let split: SplitText | undefined;
      const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
      tl.to(".gm-eyebrow", { autoAlpha: 1, y: 0, duration: 1 }, 0)
        .add(() => {
          gsap.set(titulo, { autoAlpha: 1 });
          if (!split) return;
          // por renglón (antes letra por letra: decenas de piezas a la vez)
          gsap.from(split.lines, { yPercent: 112, duration: 1.4, stagger: 0.1, ease: "expo.out" });
        }, 0.08)
        .to(".gm-linea", { scaleX: 1, duration: 1.4, ease: "expo.inOut" }, 0.2)
        .to(".gm-pestana", { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.05 }, 0.45)
        .to(entrada.current, { rotationY: 0, z: 0, duration: chico ? 1.6 : 1.8 }, 0.3)
        .to(escena.current, { autoAlpha: 1, duration: 1.1, ease: "power2.out" }, 0.3)
        .to(".gm-piso", { autoAlpha: 1, scale: 1, duration: 1.4 }, 0.7)
        .to(".gm-barra", { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08 }, 0.85)
        .add(() => {
          yaEntro.current = true;
        });

      document.fonts.ready.then(() => {
        split = SplitText.create(titulo, { type: "lines", mask: "lines" });
        gsap.set(split.masks, { paddingBottom: "0.18em", marginBottom: "-0.18em" });
      });

      const imgs = Array.from(seccion.current!.querySelectorAll<HTMLImageElement>("img"));
      const listas = Promise.all(imgs.map((i) => (i.decode ? i.decode().catch(() => {}) : Promise.resolve())));
      ScrollTrigger.create({
        trigger: seccion.current,
        start: "top 75%",
        once: true,
        // arranca con los recortes ya decodificados: decodificar en medio de la
        // animación es lo que la traba en el celular
        onEnter: () => void listas.then(() => tl.play()),
      });

      return () => split?.revert();
    },
    { scope: seccion },
  );

  // ── Cambio de pestaña: el anillo actual se va girando hacia el fondo ──
  // Al cambiar de pestaña, la nueva arranca desde su primer modelo: si el giro ya
  // avanzó, el scroll vuelve al comienzo del pin (la sección sigue quieta en pantalla,
  // así que no se ve un salto; solo se reinicia el giro). Mateo: «si aprieto SUV no me
  // aparece desde el principio sino desde el final, entonces scrolleo y me pasa a la otra sección».
  const volverAlInicio = () => {
    const st = disparador.current;
    if (!st || window.scrollY <= st.start + 2) return;
    const lenis = (window as Window & { __lenis?: { scrollTo: (y: number, o?: { immediate?: boolean; force?: boolean }) => void } }).__lenis;
    if (lenis) lenis.scrollTo(st.start, { immediate: true, force: true });
    else window.scrollTo(0, st.start);
    ScrollTrigger.update();
    progreso.current.p = 0;
    st.getTween()?.progress(1); // el giro no «rebobina» a la vista
  };

  const cambiar = (p: PestanaMenu) => {
    if (p === pestana) return;
    setPestana(p);
    if (reducido() || !yaEntro.current) {
      volverAlInicio();
      return setVista(p);
    }
    gsap.killTweensOf([entrada.current, escena.current]);
    gsap.to(escena.current, { autoAlpha: 0, duration: 0.5, ease: "power2.in" });
    gsap.to(entrada.current, {
      rotationY: -55,
      z: -520,
      duration: 0.55,
      ease: "power3.in",
      onComplete: () => {
        volverAlInicio();
        setVista(p);
      },
    });
  };

  useEffect(() => {
    cambiarRef.current = cambiar;
  });

  // ── Flechas: llevan el scroll hasta el modelo anterior / siguiente ──
  const ir = (paso: number) => {
    const destino = Math.min(Math.max(frente + paso, 0), n - 1);
    const st = disparador.current;
    if (!st) {
      progreso.current.p = destino / Math.max(n - 1, 1);
      return pintar();
    }
    const y = st.start + (st.end - st.start) * (destino / Math.max(n - 1, 1));
    const pos = { y: window.scrollY };
    gsap.to(pos, { y, duration: 1.1, ease: "expo.inOut", onUpdate: () => window.scrollTo(0, pos.y) });
  };

  const indice = Math.min(frente, n - 1);

  return (
    <section
      ref={seccion}
      id="gama"
      aria-label="La gama"
      className="relative flex h-svh min-h-[600px] flex-col overflow-hidden bg-black pb-[clamp(5rem,11svh,6rem)] pt-[calc(var(--nav-h,80px)+clamp(0.75rem,3svh,2.5rem))] lg:pb-[clamp(1.25rem,4svh,2.75rem)]"
    >
      {/* arriba: título, pestañas debajo */}
      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-6 md:px-12">
        <div className="flex flex-col items-center gap-3 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
          <div>
            <p className="gm-eyebrow text-eyebrow mb-3 font-mono uppercase tracking-[0.14em] text-silver-300">La gama</p>
            <h2 className="text-h1 font-display font-medium leading-[1] text-white">Ingeniería de precisión.</h2>
          </div>
        </div>
        <div className="mt-5 lg:mt-7">
          <Pestanas pestana={pestana} onCambiar={cambiar} />
        </div>
      </div>

      {/* centro: luz + anillo */}
      <div className="relative min-h-0 flex-1">
        {/* luz cenital y piso */}
        <span
          aria-hidden
          className="gm-piso pointer-events-none absolute left-1/2 top-0 h-full w-[min(90%,900px)] -translate-x-1/2 bg-[radial-gradient(ellipse_50%_60%_at_50%_0%,rgba(255,255,255,0.07),rgba(255,255,255,0)_70%)]"
        />
        <span
          aria-hidden
          className="gm-piso pointer-events-none absolute left-1/2 top-[56%] h-[24%] w-[80%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(255,255,255,0.13),rgba(255,255,255,0))] md:w-[44%]"
        />
        <div ref={escena} className="absolute inset-0 [perspective:2000px]">
          <div ref={entrada} className="pointer-events-none absolute inset-0 [transform-style:preserve-3d]">
            <div ref={anillo} className="pointer-events-none absolute inset-0 [transform-style:preserve-3d]">
              {modelos.map((m, i) => (
                <Link
                  key={`${vista}-${m.nombre}`}
                  href={m.href}
                  ref={(el) => {
                    autos.current[i] = el;
                  }}
                  aria-label={`Ver ${m.nombre}`}
                  tabIndex={i === indice ? 0 : -1}
                  draggable={false}
                  className="group pointer-events-auto absolute left-1/2 top-1/2 block [backface-visibility:hidden] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  <span className="block transition-transform duration-700 ease-[var(--ease-primary)] group-hover:-translate-y-[3%] group-hover:scale-[1.03]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.foto} alt="" draggable={false} className="block aspect-[900/420] w-full object-contain" />
                    {/* reflejo en el piso */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.foto}
                      alt=""
                      aria-hidden
                      draggable={false}
                      className="-mt-[3%] block aspect-[900/420] w-full -scale-y-100 object-contain opacity-[0.16] [mask-image:linear-gradient(to_top,black_0%,transparent_45%)]"
                    />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* abajo: nombre, flechas, ver modelo */}
      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-6 md:px-12">
        <Barra modelo={modelos[indice]} indice={indice} total={n} onAtras={() => ir(-1)} onAdelante={() => ir(1)} />
      </div>
    </section>
  );
}
