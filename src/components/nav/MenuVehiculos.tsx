"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import { MODELOS_MENU, PESTANAS, type PestanaMenu } from "@/lib/vehicles/menu-modelos";
import { pegar } from "@/lib/texto";

gsap.registerPlugin(useGSAP);

const reducido = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Pestañas + grilla de modelos (referencia: menú MODELS de genesis.com).
 * La usan el panel de escritorio y la segunda pantalla del menú del celular.
 * Al cambiar de pestaña los autos salen y entran desde la derecha, uno detrás de otro.
 */
export function GrillaModelos({
  onElegir,
  columnas = "grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5",
  entrar = 0,
}: {
  onElegir?: () => void;
  columnas?: string;
  /** cambia cuando el panel se abre: vuelve a correr la entrada de los autos */
  entrar?: number;
}) {
  const raiz = useRef<HTMLDivElement>(null);
  const [pestana, setPestana] = useState<PestanaMenu>("autos");
  const modelos = MODELOS_MENU.filter((m) => m.pestana === pestana);
  const p = PESTANAS.find((x) => x.id === pestana)!;

  // La luz de la pestaña activa: se desliza (o salta, la primera vez y al cambiar el ancho).
  const lista = useRef<HTMLDivElement>(null);
  const luz = useRef<HTMLSpanElement>(null);
  const ubicada = useRef(false);
  useGSAP(
    () => {
      const mover = (animar: boolean) => {
        const btn = lista.current?.querySelector<HTMLElement>(`[data-pestana="${pestana}"]`);
        if (!btn || !luz.current || btn.offsetWidth === 0) return;
        const destino = {
          x: btn.offsetLeft + btn.offsetWidth * 0.18,
          y: btn.offsetTop + btn.offsetHeight - 1,
          width: btn.offsetWidth * 0.64,
          opacity: 1,
        };
        gsap.killTweensOf(luz.current);
        if (!animar || reducido()) gsap.set(luz.current, destino);
        else gsap.to(luz.current, { ...destino, duration: 0.8, ease: "expo.inOut" });
      };
      mover(ubicada.current);
      ubicada.current = true;
      // El ResizeObserver avisa una vez apenas se engancha: ese primer aviso se ignora,
      // si no cortaba el deslizamiento y la luz saltaba de golpe.
      let primero = true;
      const ro = new ResizeObserver(() => {
        if (primero) return void (primero = false);
        mover(false);
      });
      if (lista.current) ro.observe(lista.current);
      return () => ro.disconnect();
    },
    { scope: raiz, dependencies: [pestana] }
  );

  useGSAP(
    () => {
      if (reducido()) return;
      gsap.fromTo(
        ".gm-auto",
        { x: 56, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: 0.9, ease: "expo.out", stagger: 0.04, delay: entrar ? 0.3 : 0 }
      );
    },
    { scope: raiz, dependencies: [pestana, entrar] }
  );

  return (
    <div ref={raiz}>
      {/* Mateo (2026-11-10): pestañas centradas y «otro tipo de efecto, algo más premium,
          no ese circulito blanco». Ahora son texto sobre una línea fina; una luz blanca se
          desliza por esa línea hasta la pestaña elegida (0,8 s expo.inOut) y el texto se
          enciende. Celular: las 6 a la vista en 3 columnas (D: «no sabés si hay autos»). */}
      <div className="lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-end lg:gap-6">
        <span aria-hidden className="hidden lg:block" />
        <div ref={lista} role="tablist" aria-label="Categorías" className="relative grid w-full grid-cols-3 lg:flex lg:w-auto lg:justify-center">
          {/* línea base de cada fila (en el celular hay dos filas) */}
          <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/[0.12] max-lg:top-1/2 max-lg:bottom-auto max-lg:-translate-y-px" />
          <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/[0.12]" />
          {/* la luz que se desliza */}
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
                role="tab"
                data-pestana={t.id}
                aria-selected={activa}
                onClick={() => setPestana(t.id)}
                className={`relative shrink-0 px-2 py-3.5 text-[10px] font-medium uppercase tracking-[0.18em] transition-colors duration-700 ease-[var(--ease-primary)] lg:px-5 lg:py-3 lg:text-[11px] lg:tracking-[0.22em] ${
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
        <Link
          href={p.verTodos}
          onClick={onElegir}
          className="group hidden shrink-0 items-center gap-2 justify-self-end pb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white lg:inline-flex"
        >
          Ver todos
          <ArrowRight size={14} className="transition-transform duration-700 ease-[var(--ease-primary)] group-hover:translate-x-1" />
        </Link>
      </div>

      <ul className={`mt-6 grid gap-x-5 gap-y-7 lg:mt-8 lg:gap-x-6 lg:gap-y-9 ${columnas}`}>
        {modelos.map((m) => (
          <li key={m.nombre} className="gm-auto">
            <Link href={m.href} onClick={onElegir} className="group block">
              <span className="relative block aspect-[900/420] overflow-hidden">
                {m.recorte ? (
                  <>
                    {/* luz de piso de vitrina: se enciende cuando el auto avanza */}
                    <span
                      aria-hidden
                      className="absolute inset-x-[8%] bottom-[2%] h-[26%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(255,255,255,0.16),rgba(255,255,255,0))] transition-[transform,opacity] duration-700 ease-[var(--ease-primary)] group-hover:scale-110 group-hover:opacity-100 lg:opacity-70"
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.foto}
                      alt=""
                      loading="lazy"
                      className="relative h-full w-full object-contain transition-transform duration-700 ease-[var(--ease-primary)] group-hover:-translate-y-[3%] group-hover:scale-[1.07]"
                    />
                  </>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.foto}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-primary)] group-hover:scale-[1.05]"
                  />
                )}
              </span>
              {/* Mateo: «más premium el nombre con la etiqueta de la nafta». Sin píldora: el
                  nombre en la serif de títulos y, debajo, el combustible en versalitas
                  espaciadas detrás de un filete fino que se alarga al pasar el mouse. */}
              <span className="mt-3 block text-balance font-display text-xl leading-[1.1] tracking-[-0.01em] text-white lg:text-[1.65rem]">
                {pegar(m.nombre)}
              </span>
              <span className="mt-3 flex items-center gap-2 lg:gap-3">
                <span aria-hidden className="h-px w-3.5 shrink-0 bg-white/35 transition-[width,background-color] lg:w-5 duration-700 ease-[var(--ease-primary)] group-hover:w-9 group-hover:bg-white/70" />
                <span className="font-subtitulo text-[10px] font-medium uppercase tracking-[0.2em] text-white/60 lg:tracking-[0.28em]">
                  {m.combustible}
                </span>
                <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.16em] text-white/55 lg:tracking-[0.2em] transition-colors duration-500 group-hover:text-white">
                  Ver más
                  <ArrowRight size={12} className="transition-transform duration-700 ease-[var(--ease-primary)] group-hover:translate-x-1" />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href={p.verTodos}
        onClick={onElegir}
        className="mt-8 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-white lg:hidden"
      >
        Ver todos <ArrowRight size={14} />
      </Link>
    </div>
  );
}

/**
 * Panel de escritorio: baja como cortina desde atrás del header (0,9 s expo.inOut)
 * y los autos entran desde la derecha. Al cerrar, sube en 0,7 s.
 */
export function PanelVehiculos({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const [vueltas, setVueltas] = useState(0);
  const [prev, setPrev] = useState(abierto);
  if (prev !== abierto) {
    setPrev(abierto);
    if (abierto) setVueltas((n) => n + 1);
  }

  const montado = useRef(false);
  useGSAP(
    () => {
      const r = reducido();
      if (!montado.current) {
        montado.current = true;
        gsap.set(panel.current, { yPercent: -101, visibility: "hidden" });
        if (!abierto) return;
      }
      // Mateo (2026-11-10): «hay veces que se buguea y ni siquiera se baja». Causa: si se
      // abría mientras el cierre seguía corriendo, el cierre terminaba después y escondía
      // el panel ya abierto. Ahora cada orden mata la animación anterior antes de empezar.
      gsap.killTweensOf(panel.current);
      if (abierto) {
        gsap.set(panel.current, { visibility: "visible" });
        gsap.to(panel.current, { yPercent: 0, duration: r ? 0 : 0.9, ease: "expo.inOut" });
      } else {
        gsap.to(panel.current, {
          yPercent: -101,
          duration: r ? 0 : 0.7,
          ease: "power3.inOut",
          onComplete: () => gsap.set(panel.current, { visibility: "hidden" }),
        });
      }
    },
    { dependencies: [abierto] }
  );

  return (
    <div className="pointer-events-none absolute inset-x-0 top-full hidden overflow-hidden lg:block" aria-hidden={!abierto}>
      <div
        ref={panel}
        id="panel-vehiculos"
        data-lenis-prevent
        style={{ visibility: "hidden" }}
        className="pointer-events-auto max-h-[calc(100svh-var(--nav-h))] overflow-y-auto bg-[linear-gradient(180deg,#0b0b0d_0%,#121317_100%)] px-12 pb-12 pt-6 text-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)]"
      >
        <GrillaModelos onElegir={onCerrar} entrar={vueltas} />
      </div>
    </div>
  );
}
