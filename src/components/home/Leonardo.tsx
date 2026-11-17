"use client";

// Sección «Leonardo» del inicio · El recorrido de tu Mercedes (D-070; Mateo, 2026-11-17: «Va,
// pasalo al inicio»). Vino de tres rondas de prototipos: Frase (título que se enciende, foto
// fundida con el negro) y, después de rechazar las cifras y pasos «insulsos», «armá uno solo,
// profesional». Datos: D-071 (más de 30 años; Mega y respaldo de «Sobre mí»). Rechazos: D-073.
// Referencia: GSAP · Horizontal scrolling gallery (demos.gsap.com/demo/horizontal-scrolling-gallery).
// - La sección queda quieta y avanza de costado: primero Leonardo (foto, título que se
//   enciende y las cifras que cuentan), después cuatro escenas a pantalla completa, una por
//   paso, con su número gigante calado.
// - Un mismo Clase E (recorte sin fondo del menú) acompaña el recorrido: aparece en el paso 1
//   y se va acercando paso a paso; en la entrega se le prenden las luces bajo un cono de luz.
//   El recorte está de tres cuartos mirando a la izquierda (con la patente «E-Class»): no se
//   espeja ni cruza de costado, se acerca.
// - Paso 1: la gama detrás, en la línea del horizonte. Paso 2: las tres formas de comprar
//   (links a sus páginas). Paso 4: el botón de WhatsApp (el platino del sitio en verde).
import Image from "next/image";
import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { BotonCromo } from "@/components/ui/BotonCromo";
import { waLink, WA_GENERIC_MESSAGE } from "@/lib/site";
import { pegar } from "@/lib/texto";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const CIFRAS = [
  { n: 30, etiqueta: "años de Leonardo en el rubro automotriz" },
  { n: 45, etiqueta: "años de Automotores Mega" },
  { n: 40000, etiqueta: "unidades entregadas por Mega" },
];
const fmt = (n: number) => `+${Math.round(n).toLocaleString("es-AR")}`;

const GAMA = ["amg-gt-coupe", "gle", "clase-g", "vito-tourer", "sprinter-combi", "actros"];

/** escala del auto al llegar a cada paso (se acerca) */
const ESCALA = [0.5, 0.66, 0.82, 1, 1];

export default function Leonardo() {
  const sec = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const s = sec.current!;
      const contador = s.querySelector<HTMLElement>(".rc-contador")!;
      // palabras sueltas: el pin se crea de una (dentro de document.fonts.ready quedaba corrido)
      const split = SplitText.create(s.querySelector(".rc-titulo"), { type: "words", reduceWhiteSpace: false });
      gsap.set(".rc-pano", { autoAlpha: 1 });
      // con movimiento reducido el auto no se acerca ni se desplaza: solo aparece
      const esc = (i: number) => (reducido ? 1 : ESCALA[i]);
      gsap.set(".rc-auto", { autoAlpha: 0, scale: esc(0), xPercent: reducido ? 0 : 30, transformOrigin: "50% 100%" });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: s,
          start: "top top",
          end: "+=500%",
          pin: true,
          scrub: reducido ? true : 0.9,
          invalidateOnRefresh: true,
        },
      });

      // ── la foto se abre mientras la sección va entrando (antes del pin): al llegar arriba ya
      //    está Leonardo, no una pantalla negra (2026-11-17, mirando el inicio en el celular) ──
      gsap
        .timeline({ scrollTrigger: { trigger: s, start: "top 85%", end: "top 10%", scrub: reducido ? true : 0.9 } })
        .to(".rc-pano", { xPercent: -101, duration: 1, ease: "power2.inOut" }, 0)
        .fromTo(".rc-foto", { scale: reducido ? 1 : 1.2 }, { scale: 1, duration: 1.3, ease: "power2.out" }, 0);

      // ── intro (ya fija): el título se enciende y las cifras cuentan ──
      tl.fromTo(split.words, { opacity: 0.16 }, { opacity: 1, duration: 0.06, stagger: 0.03 }, 0.06)
        .from(".rc-cifra", { y: 26, opacity: 0, duration: 0.12, stagger: 0.04, ease: "power2.out" }, 0.38);
      s.querySelectorAll<HTMLElement>(".rc-num").forEach((el, i) => {
        const o = { v: 0 };
        el.textContent = fmt(0);
        tl.to(o, { v: CIFRAS[i].n, duration: 0.25, ease: "power1.out", onUpdate: () => (el.textContent = fmt(o.v)) }, 0.4 + i * 0.04);
      });

      // ── las cuatro escenas: la pista corre de costado y el auto se acerca ──
      const ancho = () => s.clientWidth;
      const T0 = 0.85; // donde termina la intro
      const PASO = 1.35; // cada paso: 0,8 de viaje + 0,55 quieto para leer
      for (let i = 1; i <= 4; i++) {
        const t = T0 + (i - 1) * PASO;
        tl.to(".rc-pista", { x: () => -ancho() * i, duration: 0.8, ease: "power2.inOut" }, t);
        // el texto de la escena entra cuando la escena ya está casi en su lugar
        tl.from(`.rc-escena-${i} .rc-entra`, { y: 34, opacity: 0, duration: 0.3, stagger: 0.06, ease: "power2.out" }, t + 0.42);
        tl.from(`.rc-escena-${i} .rc-numero`, { xPercent: 18, opacity: 0, duration: 0.6, ease: "power2.out" }, t + 0.15);
        // el auto: aparece en el paso 1 y se acerca en cada paso
        if (i === 1) tl.to(".rc-auto", { autoAlpha: 1, duration: 0.25 }, t + 0.25);
        tl.to(".rc-auto", { scale: esc(i), xPercent: reducido ? 0 : i === 1 ? 8 : 0, duration: 0.8, ease: "power2.inOut" }, t);
      }
      // entrega (paso 3): se prenden los faros, nada más (2026-11-17, Mateo: «no se iluminan
      // correctamente las luces… parece súper arruinada la foto… solo quiero que sea el faro»;
      // salieron el cono de luz de arriba y el haz hacia adelante)
      const t3 = T0 + 2 * PASO;
      tl.fromTo(".rc-faro", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }, t3 + 0.5);
      // el auto se corre a un costado en la posventa para dejar lugar al cierre
      if (!reducido) tl.to(".rc-auto", { xPercent: 6, duration: 0.8, ease: "power2.inOut" }, T0 + 3 * PASO);
      tl.to({}, { duration: 0.3 }); // un respiro al final antes de soltar

      // contador «01 / 04»: según en qué escena está la pista
      const marcas = [T0 + 0.4, T0 + PASO + 0.4, T0 + 2 * PASO + 0.4, T0 + 3 * PASO + 0.4];
      tl.eventCallback("onUpdate", () => {
        const tt = tl.time();
        const n = marcas.filter((m) => tt >= m).length;
        contador.textContent = n ? `0${n} / 04` : "";
        contador.style.opacity = n ? "1" : "0";
      });
      return () => split.revert();
    },
    { scope: sec },
  );

  return (
    <section ref={sec} aria-label="Leonardo Guzmán, tu asesor" className="relative h-svh overflow-hidden bg-mb-black text-white">
      {/* ── la pista: intro + 4 escenas, una al lado de la otra ── */}
      <div className="rc-pista absolute inset-y-0 left-0 flex w-[500%]">
        {/* 0 · Leonardo */}
        <div className="relative flex h-full w-1/5 flex-col lg:block">
          <div className="relative min-h-[7rem] flex-1 overflow-hidden lg:absolute lg:inset-y-0 lg:left-0 lg:w-[50%]">
            <div className="rc-foto absolute inset-0">
              {/* recorte: afuera el cliente (izquierda) y la marca de Gemini (abajo a la derecha) */}
              <Image
                src="/foto-home.jpg"
                alt="Leonardo Guzmán explicando la pantalla de una Clase E"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="origin-[58%_30%] scale-[1.3] object-cover object-[50%_25%]"
              />
            </div>
            <span aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,5,5,0)_30%,#050505_100%)] lg:bg-[linear-gradient(to_left,#050505_0%,#050505_9%,rgba(5,5,5,0.7)_27%,rgba(5,5,5,0)_55%),linear-gradient(to_top,#050505_0%,rgba(5,5,5,0.7)_14%,rgba(5,5,5,0)_38%)]" />
            <span aria-hidden className="rc-pano invisible absolute inset-0 bg-mb-black" />
          </div>
          <div className="relative z-10 -mt-8 px-6 pb-[clamp(1.25rem,5svh,3rem)] md:px-12 lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:flex lg:w-[50%] lg:flex-col lg:justify-center lg:pb-0 lg:pl-0 lg:pr-[clamp(3rem,6vw,7rem)] lg:pt-[var(--nav-h)]">
            <span className="text-eyebrow block font-mono uppercase tracking-[0.14em] text-white/80">Leonardo Guzmán · Paraná, Entre Ríos</span>
            <h2 className="rc-titulo mt-3 font-display text-[min(clamp(1.8rem,0.9rem+3.2vw,4.2rem),8svh)] font-medium leading-[1.06] tracking-[-0.015em] text-white lg:mt-4">
              <span className="lg:block">{pegar("La compra más importante")}</span>{" "}
              <span className="lg:block">{pegar("empieza con una conversación.")}</span>
            </h2>
            <dl className="mt-[clamp(1rem,4svh,2.75rem)] grid grid-cols-3 gap-x-4 lg:gap-x-8">
              {CIFRAS.map((c) => (
                <div key={c.etiqueta} className="rc-cifra">
                  <dt className="sr-only">{c.etiqueta}</dt>
                  <dd>
                    <span className="rc-num block font-display text-[min(clamp(1.6rem,1rem+2.6vw,3.8rem),7svh)] font-medium leading-none tracking-[-0.02em] tabular-nums">{fmt(c.n)}</span>
                    <span className="mt-1.5 block text-[11px] leading-snug text-white/75 lg:mt-2 lg:text-[13px]">{pegar(c.etiqueta)}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <span className="mt-[clamp(1rem,4svh,2.5rem)] hidden items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white/60 lg:flex">
              {pegar("Bajá: te acompañamos en cada paso")} <span aria-hidden>→</span>
            </span>
          </div>
        </div>

        {/* 1 · Elegimos juntos tu modelo — la gama en el horizonte */}
        <Escena n={1} titulo="Elegimos juntos tu modelo" bajada="Autos, SUV, Mercedes-AMG, Vans, Sprinter y camiones: toda la gama, de la mano de alguien que la conoce.">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[clamp(9rem,30svh,20rem)] flex items-end justify-center gap-[2vw] opacity-30 lg:bottom-[clamp(8rem,26svh,17rem)] lg:justify-end lg:pr-[4vw]">
            {GAMA.map((g) => (
              <Image key={g} src={`/menu-modelos/${g}.webp`} alt="" width={900} height={420} className="h-auto w-[18vw] grayscale lg:w-[10vw]" />
            ))}
          </div>
        </Escena>

        {/* 2 · Armamos la operación — las tres formas de comprar */}
        <Escena n={2} titulo="Armamos la operación" bajada="Elegís cómo pagarlo y lo armamos con vos.">
          <div className="rc-entra mt-[clamp(1rem,3.5svh,2rem)] flex flex-wrap gap-2.5">
            <BotonCromo href="/financiacion" className="px-5! text-[10px]!">Mercedes-Benz Financiera</BotonCromo>
            <BotonCromo href="/plan-ahorro" className="px-5! text-[10px]!">Plan de ahorro oficial</BotonCromo>
            <BotonCromo href="/usados" className="px-5! text-[10px]!">Usados Selección Premium</BotonCromo>
          </div>
        </Escena>

        {/* 3 · Te entregamos tu unidad — la luz se hace en el auto (capa del auto) */}
        <Escena n={3} titulo="Te entregamos tu unidad" bajada="En Automotores Mega, concesionario oficial Mercedes-Benz en Paraná." />

        {/* 4 · Te acompañamos en la posventa — el cierre */}
        <Escena n={4} titulo="Te acompañamos en la posventa" bajada="Después de la entrega seguimos estando, para lo que necesites.">
          <div className="rc-entra mt-[clamp(1.25rem,4svh,2.5rem)] flex flex-wrap items-center gap-x-6 gap-y-3">
            <BotonCromo href={waLink(WA_GENERIC_MESSAGE)} externo tono="verde">
              <span className="flex items-center gap-2.5">
                <WhatsAppIcon className="h-4 w-4" />
                Escribime
              </span>
            </BotonCromo>
            <span className="text-sm text-white/80">
              <span className="block font-display text-[1.1rem] leading-tight text-white">Leonardo Guzmán</span>
              {pegar("Promotor de ventas · Automotores Mega SA")}
            </span>
          </div>
        </Escena>
      </div>

      {/* ── el auto: queda en su lugar mientras las escenas corren, y se acerca. Centrado con
          márgenes, no con translate: GSAP toma el `translate` de Tailwind y lo pisa (en el
          celular el auto quedaba cortado a la derecha) ── */}
      <div
        aria-hidden
        className="rc-auto pointer-events-none absolute inset-x-0 bottom-[clamp(1.5rem,6svh,4rem)] z-20 mx-auto w-[min(94vw,62svh)] lg:left-auto lg:right-[3vw] lg:mx-0 lg:w-[min(50vw,96svh)]"
      >
        {/* luz en el piso */}
        <span className="absolute bottom-[4%] left-[6%] h-[22%] w-[88%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(255,255,255,0.14),rgba(255,255,255,0))]" />
        <Image src="/menu-modelos/clase-e.webp" alt="" width={900} height={420} priority={false} className="relative h-auto w-full" />
        {/* faros, justo sobre las ópticas del recorte (900 × 420): la de adelante ocupa
            x 245–355, y 195–232 (inclinada); la del otro lado asoma en x ≈ 105, y ≈ 198.
            Solo un brillo con la forma de la óptica, sin blend (con `mix-blend-screen` dentro
            del auto escalado se veía un rectángulo claro) */}
        <span className="rc-faro absolute left-[27.5%] top-[45.5%] h-[8%] w-[11.5%] opacity-0">
          {/* la inclinación va adentro: GSAP escala el de afuera y pisaría el `rotate` */}
          <span className="block h-full w-full -rotate-[8deg] rounded-[50%] bg-[radial-gradient(closest-side,rgba(240,248,255,0.9),rgba(200,225,255,0.45)_55%,rgba(200,225,255,0))]" />
        </span>
        <span className="rc-faro absolute left-[10.4%] top-[45%] h-[5%] w-[3.4%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(240,248,255,0.75),rgba(200,225,255,0))] opacity-0" />
      </div>

      {/* contador de escena */}
      <span className="rc-contador pointer-events-none absolute bottom-[clamp(1rem,3svh,2rem)] left-6 z-30 font-mono text-[11px] tracking-[0.2em] text-white/70 opacity-0 transition-opacity duration-300 md:left-12" />
    </section>
  );
}

/** Una escena del recorrido: número gigante calado detrás y el texto arriba a la izquierda. */
function Escena({ n, titulo, bajada, children }: { n: number; titulo: string; bajada: string; children?: ReactNode }) {
  return (
    <div className={`rc-escena-${n} relative h-full w-1/5 overflow-hidden`}>
      <span
        aria-hidden
        className="rc-numero pointer-events-none absolute right-[3vw] top-[47svh] select-none font-display text-[min(58vw,40svh)] font-medium leading-none tracking-[-0.04em] text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.22)] lg:right-[6vw] lg:top-[calc(var(--nav-h)-2svh)] lg:text-[min(36vw,64svh)]"
      >
        0{n}
      </span>
      {children && n === 1 ? children : null}
      <div className="relative z-10 px-6 pt-[calc(var(--nav-h)+clamp(1rem,4svh,2.5rem))] md:px-12 lg:w-[50%] lg:pl-[clamp(3rem,6vw,7rem)] lg:pt-[calc(var(--nav-h)+clamp(2rem,12svh,9rem))]">
        <span className="rc-entra block font-mono text-[11px] uppercase tracking-[0.2em] text-white/70">Paso 0{n} · Te acompañamos en cada paso</span>
        <h3 className="rc-entra mt-3 font-display text-[min(clamp(2rem,1rem+4vw,5.2rem),9svh)] font-medium leading-[1.02] tracking-[-0.02em] text-white">
          {pegar(titulo)}
        </h3>
        <p className="rc-entra mt-[clamp(0.75rem,2.5svh,1.5rem)] max-w-[44ch] text-[15px] leading-relaxed text-white/80 lg:text-[clamp(1rem,0.8rem+0.4vw,1.2rem)]">{pegar(bajada)}</p>
        {children && n !== 1 ? children : null}
      </div>
    </div>
  );
}
