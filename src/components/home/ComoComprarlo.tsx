"use client";

// «Cómo comprarlo» del inicio (D-064). Elegido el 2026-11-12 después de dos rondas:
// - Ronda 1 (Columnas, Tipografía, Escena): Mateo eligió Tipografía y después la descartó:
//   «prefiero que modifiquemos y rediseñemos con otro estilo, mejor inclinarlas por algo con
//   cards, o algo más claro, atractivo, que tenga la info mejor puesta».
// - Ronda 2 de cards (6 referencias) → prototipos «Cards Mercedes» y «Cards 3D» →
//   «vamos a ir por la 2, pero el card de otro color, y en usados fijate que estás tapando
//   los autos… entre los 3 distribuí cada categoría de vehículo, un AMG, una Sprinter, una
//   Vans… donde se vean bien todos» → «Sí, pasala».
//
// Cómo funciona (referencia: Aceternity · 3D Card Effect, rehecho en GSAP):
// - Sección papel con tres cards grafito. En la compu cada card se inclina siguiendo el
//   mouse (hasta 10° en Y, 8° en X; quickTo 0,9 s) y sus piezas salen a distintas
//   profundidades: los vehículos (recortes sin fondo del menú, D-057) son lo que más
//   «sale», después el nombre, el botón y la frase.
// - Dos vehículos por card, uno de cada pestaña del menú, sin taparse: atrás arriba a la
//   derecha, adelante abajo a la izquierda. El ancho se limita también por el alto de la
//   zona (cqh) para que en pantallas bajas no se pisen. Vans, Sprinter y camiones se
//   agrandan porque su recorte es más angosto (como en la gama).
// - Entrada (una vez, al 65 %, con los recortes decodificados): título por renglón, las
//   cards suben (1,4 s) y los vehículos llegan desde la derecha (miran a la izquierda,
//   1,6 s expo.out), escalonados.
// - Celular: la misma card que en la compu, una debajo de la otra, cada una de ~52 % de la
//   pantalla (Mateo: «quiero que sea el mismo pero acomodarlo de forma que se vea bien en
//   teléfono»; antes las tres entraban en una pantalla y quedaban bajas, con los vehículos
//   chicos). Sin inclinación ni profundidad (sacaban los vehículos de la card); toda la card
//   lleva a la página. Tablet: dos columnas. Botón platino «Más info» abajo a la derecha en
//   todos los tamaños (Mateo: «¿por qué no tiene el botón como en desktop?»).
// - La opacidad de la entrada va en la card (el contenedor con perspectiva), nunca en el
//   plano con preserve-3d (G-053).
// - Grises con contraste (Mateo: «no me gusta que uses esos grises… no se notan»): blanco
//   al 80 % sobre grafito.
import Link from "next/link";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { BotonCromo } from "@/components/ui/BotonCromo";
import { pegar } from "@/lib/texto";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Camino = {
  n: string;
  nombre: string;
  frase: string;
  href: string;
  /** recortes sin fondo de `public/menu-modelos/`: [atrás, adelante] */
  autos: [string, string];
};

const CAMINOS: Camino[] = [
  {
    n: "01",
    nombre: "Financiación",
    frase: "Accedé a tu Mercedes-Benz de la manera más simple, con Mercedes-Benz Financiera.",
    href: "/financiacion",
    autos: ["/menu-modelos/gle.webp", "/menu-modelos/clase-s.webp"], // SUV + Autos
  },
  {
    n: "02",
    nombre: "Plan de ahorro",
    frase: "Armá tu plan a la medida, con el plan de ahorro oficial de Mercedes-Benz.",
    href: "/plan-ahorro",
    autos: ["/menu-modelos/vito-tourer.webp", "/menu-modelos/amg-gt-coupe.webp"], // Vans + AMG
  },
  {
    n: "03",
    nombre: "Usados",
    frase: "Autos, utilitarios y camiones Mercedes-Benz usados, en Automotores Mega SA.",
    href: "/usados",
    autos: ["/menu-modelos/actros.webp", "/menu-modelos/sprinter-combi.webp"], // Camiones + Sprinter
  },
];

/** [atrás, adelante]. Los recortes tienen el vehículo entre el 13 % y el 90 % del alto:
 *  el de atrás arranca por encima del techo del de adelante. */
const LUGAR = [
  // escalonados, igual en celular y compu: el de atrás más arriba y a la derecha
  { clase: "right-0 bottom-[52%] w-[min(64%,95cqh)]", z: 40 },
  { clase: "left-0 bottom-[3%] w-[min(70%,112cqh)]", z: 100 },
];
/** Recortes más angostos que se agrandan (como en la gama). */
const AGRANDAR: Record<string, number> = { "vito-tourer": 1.12, "sprinter-combi": 1.25, actros: 1.3 };

/** Profundidad solo en la compu: `--z` + translateZ desde 1024 px. */
const Z = "lg:[transform:translateZ(var(--z))]";
const z = (px: number) => ({ "--z": `${px}px` }) as React.CSSProperties;

const reducido = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function ComoComprarlo() {
  const sec = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = sec.current;
      if (!el) return;
      const r = reducido();
      if (!r) {
        gsap.set(".cc3-sube", { yPercent: 108 });
        gsap.set(".cc3-card", { autoAlpha: 0, y: 60 });
        gsap.set(".cc3-auto", { xPercent: 45, autoAlpha: 0 });
        // arranca con los recortes decodificados: decodificar en medio traba el celular
        const imgs = gsap.utils.toArray<HTMLImageElement>(".cc3-auto");
        const listas = Promise.all(imgs.map((i) => (i.decode ? i.decode().catch(() => {}) : Promise.resolve())));
        const cards = gsap.utils.toArray<HTMLElement>(".cc3-card");

        if (window.matchMedia("(min-width: 1024px)").matches) {
          // compu: las tres cards se ven juntas → una sola entrada
          const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
          tl.to(".cc3-sube", { yPercent: 0, duration: 1.4, stagger: 0.08 }, 0)
            .to(cards, { autoAlpha: 1, y: 0, duration: 1.4, stagger: 0.12 }, 0.2)
            .to(".cc3-auto", { xPercent: 0, autoAlpha: 1, duration: 1.6, stagger: 0.1 }, 0.55);
          ScrollTrigger.create({ trigger: el, start: "top 65%", once: true, onEnter: () => void listas.then(() => tl.play()) });
        } else {
          // celular/tablet: la sección se scrollea → cada card entra recién cuando aparece
          ScrollTrigger.create({
            trigger: el,
            start: "top 70%",
            once: true,
            onEnter: () => void gsap.to(".cc3-sube", { yPercent: 0, duration: 1.4, stagger: 0.08, ease: "expo.out" }),
          });
          cards.forEach((card) => {
            const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
            tl.to(card, { autoAlpha: 1, y: 0, duration: 1.4 }, 0).to(card.querySelectorAll(".cc3-auto"), {
              xPercent: 0,
              autoAlpha: 1,
              duration: 1.6,
              stagger: 0.12,
            }, 0.3);
            ScrollTrigger.create({ trigger: card, start: "top 85%", once: true, onEnter: () => void listas.then(() => tl.play()) });
          });
        }
      }

      // inclinación con el mouse (solo compu)
      if (r || !window.matchMedia("(hover: hover) and (min-width: 1024px)").matches) return;
      const quitar: (() => void)[] = [];
      gsap.utils.toArray<HTMLElement>(".cc3-card").forEach((card) => {
        const plano = card.querySelector<HTMLElement>(".cc3-plano");
        if (!plano) return;
        const rx = gsap.quickTo(plano, "rotationX", { duration: 0.9, ease: "power3.out" });
        const ry = gsap.quickTo(plano, "rotationY", { duration: 0.9, ease: "power3.out" });
        const mover = (e: PointerEvent) => {
          const b = card.getBoundingClientRect();
          ry(((e.clientX - b.left) / b.width - 0.5) * 20);
          rx(-((e.clientY - b.top) / b.height - 0.5) * 16);
        };
        const salir = () => {
          rx(0);
          ry(0);
        };
        card.addEventListener("pointermove", mover);
        card.addEventListener("pointerleave", salir);
        quitar.push(() => {
          card.removeEventListener("pointermove", mover);
          card.removeEventListener("pointerleave", salir);
        });
      });
      return () => quitar.forEach((q) => q());
    },
    { scope: sec },
  );

  return (
    <section
      ref={sec}
      aria-label="Cómo comprarlo"
      data-nav-theme="papel"
      className="section-paper flex flex-col pb-[clamp(2.5rem,7svh,4rem)] pt-[calc(var(--nav-h,64px)+clamp(1rem,4svh,2.5rem))] lg:min-h-svh lg:justify-center lg:py-[calc(var(--nav-h,80px)+clamp(1rem,4svh,3rem))]"
    >
      <div className="mx-auto flex w-full max-w-[1600px] flex-col px-6 md:px-12">
        <div className="text-center lg:text-left">
          <span className="block overflow-hidden">
            <span className="cc3-sube text-eyebrow block font-mono uppercase tracking-[0.14em] text-ink-60">Cómo comprarlo</span>
          </span>
          <h2 className="mt-3 overflow-hidden pb-[0.12em] text-h1 font-display font-medium leading-[1] text-ink">
            <span className="cc3-sube block">{pegar("Tres caminos a tu Mercedes-Benz.")}</span>
          </h2>
        </div>

        <div className="mt-6 flex flex-col gap-4 md:grid md:grid-cols-2 lg:mt-[clamp(1.5rem,4svh,3rem)] lg:h-[clamp(440px,62svh,660px)] lg:grid-cols-3 lg:gap-6">
          {CAMINOS.map((c) => (
            <div key={c.n} className="cc3-card relative h-[clamp(380px,52svh,440px)] [perspective:1100px] lg:h-auto">
              {/* la profundidad (translateZ) va solo en la compu, donde la card se inclina: en el
                  celular agrandaba los vehículos y los sacaba de la card (Mateo, en su iPhone:
                  «los autos de financiación y plan de ahorro se van del card») */}
              <div className="cc3-plano relative flex h-full flex-col overflow-hidden border border-white/10 bg-[radial-gradient(120%_80%_at_50%_100%,#24262c_0%,#121317_55%,#0b0b0d_100%)] shadow-[0_40px_70px_-34px_rgba(11,11,13,0.6)] [transform-style:preserve-3d] lg:overflow-visible">
                {/* arriba: número + nombre grande + frase */}
                <div className="flex flex-col gap-2 px-5 pt-5 [transform-style:preserve-3d] lg:gap-3 lg:p-8 lg:pb-0">
                  <span className={`font-mono text-[11px] tracking-[0.2em] text-white/80 ${Z}`} style={z(30)}>
                    {c.n}
                  </span>
                  <h3
                    className={`whitespace-nowrap font-display text-[clamp(2.1rem,9.5vw,2.8rem)] font-normal leading-[1] tracking-[-0.015em] text-white lg:text-[clamp(2rem,2.6vw,2.9rem)] ${Z}`}
                    style={z(55)}
                  >
                    {c.nombre}
                  </h3>
                  <p className={`text-[14px] leading-snug text-white/80 lg:text-[15px] ${Z}`} style={z(35)}>
                    {pegar(c.frase)}
                  </p>
                </div>

                {/* vehículos, con luz en el piso */}
                <div className="relative min-h-0 w-full flex-1 [container-type:size] [transform-style:preserve-3d]">
                  <span
                    aria-hidden
                    className={`absolute bottom-[2%] left-[4%] h-[30%] w-[92%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(255,255,255,0.12),rgba(255,255,255,0))] ${Z}`}
                    style={z(12)}
                  />
                  {c.autos.map((src, k) => (
                    <span key={src} className={`absolute block ${LUGAR[k].clase} ${Z}`} style={z(LUGAR[k].z)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt=""
                        className="cc3-auto block h-auto w-full origin-bottom"
                        style={{ scale: AGRANDAR[src.split("/").pop()!.replace(".webp", "")] ?? 1 }}
                      />
                    </span>
                  ))}
                </div>

                {/* celular: toda la card lleva a la página (el botón va encima) */}
                <Link href={c.href} aria-label={`Más info: ${c.nombre}`} className="absolute inset-0 z-10 lg:hidden" />

                {/* «Más info» abajo a la derecha: el mismo botón platino en celular y compu
                    (Mateo: «¿por qué no tiene el botón como en desktop?»), más chico en el celular */}
                <div className={`relative z-20 flex justify-end px-5 pb-5 lg:px-8 lg:pb-8 ${Z}`} style={z(45)}>
                  <BotonCromo href={c.href} className="h-9! px-4! text-[10px]! lg:h-11! lg:px-6! lg:text-[11px]!">
                    Más info
                  </BotonCromo>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
