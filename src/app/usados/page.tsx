"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DUR, GSAP_EASE, HERO_DELAY } from "@/lib/motion-tokens";

type FieldName = "name" | "phone" | "email" | "vehicle" | "message";

/** Beneficios (contenido verbatim — spec /usados). */
const BENEFITS = [
  {
    index: "01",
    title: "Atención Personalizada",
    description: "Asesoramiento experto para encontrar lo que buscas.",
  },
  {
    index: "02",
    title: "Transparencia Total",
    description: "Claridad y honestidad en cada operación.",
  },
] as const;

// Focus ring — globals.css define `:focus-visible{border-radius:2px}` SIN
// @layer, así que gana por cascada a cualquier utilidad Tailwind sin importar
// especificidad. Se fuerza `!` (important) para reafirmar cero radio (REGLAS-
// USUARIO §1) sin tocar globals.css (único archivo editable: este).
const FOCUS_RING =
  "focus-visible:outline! focus-visible:outline-2! focus-visible:outline-offset-2! focus-visible:outline-mb-blue! focus-visible:rounded-none!";

/** Reduced-motion reactivo — copiado localmente (patrón src/app/page.tsx y
 *  src/app/contact/page.tsx; este archivo no importa nada de ahí). */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

/**
 * Marca distintiva que reemplaza el `CheckCircle` genérico de lucide —
 * geometría 100% recta (REGLAS-USUARIO §1): un tick angular enmarcado por dos
 * corner-ticks, motivo "encuadre/selección" que hace eco al H1 del hero
 * ("Selección Premium") y al frame del panel de formulario. Cero curvas.
 */
function SelectionMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden>
      <path d="M4 4v7M4 4h7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M28 28v-7M28 28h-7" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9 16.5 14 21.5 23 10.5"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

export default function UsadosPage() {
  const reducedMotion = usePrefersReducedMotion();

  // ══════════════════════════════════════════════════════════════════════
  // LÓGICA INTOCABLE — mandato de la spec: NO se reprograma, solo se viste.
  // Mismo state, mismo handler, misma plantilla wa.me (%0A literal, mismos
  // emojis, misma negrita con asteriscos), mismo window.open.
  // ══════════════════════════════════════════════════════════════════════
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    vehicle: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, phone, email, vehicle, message } = formData;

    const whatsappMessage = `Hola Leonardo, estoy interesado en un *Usado Seleccionado*.%0A%0A*Mis datos:*%0A👤 Nombre: ${name}%0A📞 Teléfono: ${phone}%0A📧 Email: ${email}%0A🚗 Vehículo de interés: ${vehicle}%0A%0A*Consulta:*%0A${message}`;

    const phoneNumber = "5493425037000";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;

    window.open(whatsappUrl, "_blank");
  };
  // ══════════════════════════════════════════════════════════════ /LÓGICA

  // UI-only: dirige el estado visual de foco (label + underline draw). No
  // toca formData ni handleSubmit — puramente decorativo.
  const [focusedField, setFocusedField] = useState<FieldName | null>(null);

  // ---- Refs — hero cinematográfico ----
  const heroRef = useRef<HTMLElement>(null);
  const heroH1Ref = useRef<HTMLHeadingElement>(null);
  const heroSubRef = useRef<HTMLParagraphElement>(null);
  const heroCueRef = useRef<HTMLDivElement>(null);
  const scrollTickRef = useRef<HTMLSpanElement>(null);

  // ---- Refs — story + form ----
  const storyEyebrowRef = useRef<HTMLParagraphElement>(null);
  const storyH2Ref = useRef<HTMLHeadingElement>(null);
  const storyParaRef = useRef<HTMLDivElement>(null);
  const benefitRefs = useRef<Array<HTMLDivElement | null>>([]);
  const formPanelRef = useRef<HTMLDivElement>(null);
  const formTitleRef = useRef<HTMLDivElement>(null);
  const fieldRefs = useRef<Array<HTMLDivElement | null>>([]);
  const submitRef = useRef<HTMLDivElement>(null);

  // ---- Timeline hero — page-load, SplitText mask reveal (patrón idéntico
  //      al hero de Home: safety timeout anti-stuck + espera de fuentes) ----
  useEffect(() => {
    if (typeof window === "undefined" || !heroRef.current) return;

    const w = window as Window & {
      __gsapScrollTriggerRegistered?: boolean;
      __gsapSplitTextRegistered?: boolean;
    };
    if (!w.__gsapScrollTriggerRegistered) {
      gsap.registerPlugin(ScrollTrigger);
      w.__gsapScrollTriggerRegistered = true;
    }
    if (!w.__gsapSplitTextRegistered) {
      gsap.registerPlugin(SplitText);
      w.__gsapSplitTextRegistered = true;
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduced) {
      gsap.set([heroSubRef.current, heroCueRef.current], {
        opacity: 1,
        y: 0,
      });
      if (heroH1Ref.current) gsap.set(heroH1Ref.current, { opacity: 1 });
      return;
    }

    gsap.set([heroSubRef.current, heroCueRef.current], { opacity: 0, y: 16 });
    if (heroH1Ref.current) gsap.set(heroH1Ref.current, { autoAlpha: 0 });

    const tl = gsap.timeline({ delay: HERO_DELAY });
    tl.to(heroSubRef.current, {
      opacity: 1,
      y: 0,
      duration: DUR.element,
      ease: GSAP_EASE.secondary,
    }).to(
      heroCueRef.current,
      {
        opacity: 1,
        y: 0,
        duration: DUR.element,
        ease: GSAP_EASE.secondary,
      },
      "-=0.3",
    );

    // El H1 nunca debe quedar atrapado invisible si SplitText tarda o falla.
    const safety = window.setTimeout(() => {
      if (heroH1Ref.current) gsap.set(heroH1Ref.current, { autoAlpha: 1 });
    }, 1500);

    let heroSplit: SplitText | undefined;
    document.fonts.ready.then(() => {
      window.clearTimeout(safety);
      if (!heroH1Ref.current) return;
      heroSplit = SplitText.create(heroH1Ref.current, {
        type: "chars, words",
        mask: "chars",
        autoSplit: true,
        onSplit(self) {
          return gsap
            .timeline({ delay: HERO_DELAY + 0.05 })
            .set(heroH1Ref.current, { autoAlpha: 1 })
            .from(self.chars, {
              yPercent: 120,
              duration: DUR.hero,
              ease: GSAP_EASE.primary,
              stagger: 0.02,
            });
        },
      });
    });

    // Idle loop — único por viewport (motion-language §restraint): el tick
    // del scroll cue desciende en loop suave. Arranca tras el reveal.
    const idleTween = scrollTickRef.current
      ? gsap.to(scrollTickRef.current, {
          yPercent: 100,
          duration: 1.4,
          ease: "power1.inOut",
          repeat: -1,
          yoyo: true,
          delay: HERO_DELAY + 0.7,
        })
      : undefined;

    return () => {
      window.clearTimeout(safety);
      tl.kill();
      idleTween?.kill();
      heroSplit?.revert();
    };
  }, []);

  // ---- Reveals — story + form (ScrollTrigger, grammar variado: mask-lines
  //      en el heading, fade+y en párrafos, fade+x en beneficios, clip-path
  //      wipe en el panel — nunca el mismo fade-up repetido) ----
  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as Window & { __gsapScrollTriggerRegistered?: boolean };
    if (!w.__gsapScrollTriggerRegistered) {
      gsap.registerPlugin(ScrollTrigger);
      w.__gsapScrollTriggerRegistered = true;
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const triggers: ScrollTrigger[] = [];
    let storySplit: SplitText | undefined;

    const benefits = benefitRefs.current.filter(
      (el): el is HTMLDivElement => Boolean(el),
    );
    const fields = fieldRefs.current.filter(
      (el): el is HTMLDivElement => Boolean(el),
    );

    if (reduced) {
      gsap.set(
        [
          storyEyebrowRef.current,
          storyParaRef.current,
          formTitleRef.current,
          submitRef.current,
          ...benefits,
          ...fields,
        ].filter(Boolean),
        { opacity: 1, x: 0, y: 0 },
      );
      if (storyH2Ref.current) gsap.set(storyH2Ref.current, { opacity: 1 });
      if (formPanelRef.current) {
        gsap.set(formPanelRef.current, {
          clipPath: "inset(0% 0% 0% 0%)",
        });
      }
      return;
    }

    // Story: eyebrow + heading (mask lines) + párrafos
    gsap.set(storyEyebrowRef.current, { opacity: 0, y: 14 });
    if (storyH2Ref.current) gsap.set(storyH2Ref.current, { autoAlpha: 0 });
    gsap.set(storyParaRef.current, { opacity: 0, y: 16 });

    triggers.push(
      ScrollTrigger.create({
        trigger: storyEyebrowRef.current,
        start: "top 82%",
        once: true,
        onEnter: () => {
          gsap.to(storyEyebrowRef.current, {
            opacity: 1,
            y: 0,
            duration: DUR.element,
            ease: GSAP_EASE.secondary,
          });
          if (storyH2Ref.current) {
            document.fonts.ready.then(() => {
              if (!storyH2Ref.current) return;
              storySplit = SplitText.create(storyH2Ref.current, {
                type: "lines",
                mask: "lines",
                autoSplit: true,
                onSplit(self) {
                  return gsap
                    .timeline({ delay: 0.1 })
                    .set(storyH2Ref.current, { autoAlpha: 1 })
                    .from(self.lines, {
                      yPercent: 110,
                      duration: DUR.element,
                      ease: GSAP_EASE.primary,
                      stagger: 0.08,
                    });
                },
              });
            });
          }
          gsap.to(storyParaRef.current, {
            opacity: 1,
            y: 0,
            duration: DUR.element,
            ease: GSAP_EASE.secondary,
            delay: 0.22,
          });
        },
      }),
    );

    // Beneficios — fade+x escalonado desde la izquierda (grammar distinta
    // al fade+y del párrafo: evita el "todo entra igual").
    if (benefits.length) {
      gsap.set(benefits, { opacity: 0, x: -18 });
      triggers.push(
        ScrollTrigger.create({
          trigger: benefits[0],
          start: "top 88%",
          once: true,
          onEnter: () => {
            benefits.forEach((el, i) => {
              gsap.to(el, {
                opacity: 1,
                x: 0,
                duration: DUR.element,
                ease: GSAP_EASE.secondary,
                delay: i * 0.08,
              });
            });
          },
        }),
      );
    }

    // Panel de formulario — clip-path wipe (mismo mecanismo que la foto de
    // Leonardo en Home, asimétrico respecto a la story: la "boom" de esta
    // sección). Campos y botón entran en cascada una vez el panel se abre.
    if (formPanelRef.current) {
      gsap.set(formPanelRef.current, { clipPath: "inset(0% 0% 100% 0%)" });
      gsap.set([formTitleRef.current, submitRef.current, ...fields], {
        opacity: 0,
        y: 14,
      });
      triggers.push(
        ScrollTrigger.create({
          trigger: formPanelRef.current,
          start: "top 80%",
          once: true,
          onEnter: () => {
            gsap.to(formPanelRef.current, {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: DUR.hero,
              ease: GSAP_EASE.primary,
            });
            gsap.to(formTitleRef.current, {
              opacity: 1,
              y: 0,
              duration: DUR.element,
              ease: GSAP_EASE.secondary,
              delay: 0.3,
            });
            fields.forEach((el, i) => {
              gsap.to(el, {
                opacity: 1,
                y: 0,
                duration: DUR.element,
                ease: GSAP_EASE.secondary,
                delay: 0.42 + i * 0.07,
              });
            });
            gsap.to(submitRef.current, {
              opacity: 1,
              y: 0,
              duration: DUR.element,
              ease: GSAP_EASE.secondary,
              delay: 0.42 + fields.length * 0.07 + 0.06,
            });
          },
        }),
      );
    }

    return () => {
      triggers.forEach((t) => t.kill());
      storySplit?.revert();
    };
  }, []);

  function fieldBorderClass(field: FieldName) {
    return focusedField === field
      ? "border-mb-blue"
      : "border-white/15 hover:border-white/30";
  }

  function fieldLabelClass(field: FieldName) {
    return focusedField === field ? "text-mb-blue" : "text-silver-300";
  }

  const inputBase =
    "peer w-full rounded-none border-b bg-transparent py-3 font-sans text-base text-white placeholder-silver-700 outline-none transition-colors duration-[var(--dur-micro)] ease-[var(--ease-micro)]";

  return (
    <div className="bg-mb-black text-white">
      {/* ───────────── Hero cinematográfico ───────────── */}
      <section
        ref={heroRef}
        className="relative h-[100svh] w-full overflow-hidden bg-mb-black"
      >
        {!reducedMotion ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 z-0 h-full w-full object-cover"
          >
            <source src="/SUV_Reveal_Video_Generation.mp4" type="video/mp4" />
          </video>
        ) : (
          // Reduced-motion: sin autoplay de video — poster estático oscuro
          // (no existe un frame poster dedicado para este clip; se sustituye
          // por un degradé de marca, mismo criterio que /contact).
          <div
            aria-hidden
            className="absolute inset-0 z-0 bg-[linear-gradient(160deg,#0d0d0f_0%,#050505_70%)]"
          />
        )}

        {/* Scrim: vignette superior + masa inferior — garantiza AA para el
            copy anclado abajo, sin aplanar el video en el resto del frame. */}
        <div
          aria-hidden
          className="absolute inset-0 z-10 bg-[linear-gradient(to_top,rgba(5,5,5,0.94)_0%,rgba(5,5,5,0.62)_28%,rgba(5,5,5,0.14)_56%,transparent_72%),linear-gradient(to_bottom,rgba(5,5,5,0.55)_0%,transparent_26%)]"
        />

        <div className="relative z-20 flex h-full flex-col items-center justify-center px-6 text-center">
          <h1
            ref={heroH1Ref}
            className="text-display-1 mb-5 text-balance font-display font-medium text-white [letter-spacing:-0.01em]"
          >
            Selección Premium
          </h1>
          <p
            ref={heroSubRef}
            className="max-w-xl text-lead font-light text-silver-100"
          >
            Calidad certificada. Historia comprobada.
          </p>
        </div>

        <div
          ref={heroCueRef}
          className="absolute inset-x-0 bottom-8 z-20 flex flex-col items-center gap-3"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-silver-300">
            Desplazate
          </span>
          <span
            aria-hidden
            className="relative h-9 w-px overflow-hidden bg-white/15"
          >
            <span
              ref={scrollTickRef}
              className="absolute inset-x-0 top-0 h-1/2 bg-white"
            />
          </span>
        </div>
      </section>

      {/* ───────────── Story + Formulario ───────────── */}
      <section className="bg-mb-black py-[var(--spacing-section)]">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-x-12">
            {/* ══ Story ══ */}
            <div className="lg:col-span-5">
              <p
                ref={storyEyebrowRef}
                className="text-eyebrow mb-4 font-mono uppercase tracking-[0.14em] text-silver-300"
              >
                Confianza y Trayectoria
              </p>
              <h2
                ref={storyH2Ref}
                className="text-h1 mb-8 font-display font-medium text-white"
              >
                Más que un vehículo,
                <br />
                una relación de confianza.
              </h2>

              <div
                ref={storyParaRef}
                className="max-w-[60ch] space-y-5 text-pretty text-base font-light leading-relaxed text-silver-300"
              >
                <p>
                  En Automotores Mega, entendemos que comprar un usado es una
                  decisión importante. Por eso, cada unidad es seleccionada
                  con el compromiso de ofrecerte solo lo mejor. No se trata
                  solo de vender autos, sino de construir relaciones
                  duraderas basadas en la honestidad.
                </p>
                <p>
                  Con el respaldo de Leonardo Guzman y una trayectoria que
                  nos avala, te brindamos la tranquilidad que necesitas.
                  Conocemos lo que vendemos y te lo contamos con total
                  transparencia, para que tu única preocupación sea
                  disfrutar de tu próximo Mercedes-Benz.
                </p>
              </div>

              <div className="mt-12 flex flex-col divide-y divide-white/10 border-t border-white/10">
                {BENEFITS.map((b, i) => (
                  <div
                    key={b.index}
                    ref={(el) => {
                      benefitRefs.current[i] = el;
                    }}
                    className="flex items-start gap-4 py-5"
                  >
                    <SelectionMark className="mt-0.5 h-6 w-6 shrink-0 text-mb-blue" />
                    <div>
                      <div className="mb-1.5 flex items-baseline gap-2.5">
                        <span className="font-mono text-[11px] text-mb-blue">
                          {b.index}
                        </span>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                          {b.title}
                        </h3>
                      </div>
                      <p className="text-sm text-silver-500">
                        {b.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ══ Formulario ══ */}
            <div className="lg:col-span-7 lg:border-l lg:border-white/10 lg:pl-12">
              <div
                ref={formPanelRef}
                className="relative border border-white/[0.14] bg-surface-1 p-8 md:p-12"
              >
                {/* Corner-tick frame — motivo "encuadre/selección", eco del
                    H1 del hero. Sobrio: solo dos esquinas, sin decorar todo
                    el perímetro. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-0 top-0 h-4 w-4 border-l border-t border-mb-blue/70"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b border-r border-mb-blue/70"
                />

                <div ref={formTitleRef}>
                  <h2 className="mb-8 font-display text-2xl font-medium text-white">
                    Encuentra tu próximo vehículo
                  </h2>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-7">
                  {/* 01 — Nombre */}
                  <div
                    ref={(el) => {
                      fieldRefs.current[0] = el;
                    }}
                    className="flex flex-col gap-2"
                  >
                    <label
                      htmlFor="name"
                      className={`flex items-baseline gap-2.5 text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-[var(--dur-micro)] ${fieldLabelClass("name")}`}
                    >
                      <span className="font-mono text-[11px] text-mb-blue">
                        01
                      </span>
                      Nombre<span className="text-mb-blue">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      required
                      placeholder="Tu nombre"
                      className={`${inputBase} ${fieldBorderClass("name")} ${FOCUS_RING}`}
                    />
                  </div>

                  {/* 02/03 — Teléfono + Email */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div
                      ref={(el) => {
                        fieldRefs.current[1] = el;
                      }}
                      className="flex flex-col gap-2"
                    >
                      <label
                        htmlFor="phone"
                        className={`flex items-baseline gap-2.5 text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-[var(--dur-micro)] ${fieldLabelClass("phone")}`}
                      >
                        <span className="font-mono text-[11px] text-mb-blue">
                          02
                        </span>
                        Teléfono<span className="text-mb-blue">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("phone")}
                        onBlur={() => setFocusedField(null)}
                        required
                        placeholder="Tu celular"
                        className={`${inputBase} ${fieldBorderClass("phone")} ${FOCUS_RING}`}
                      />
                    </div>
                    <div
                      ref={(el) => {
                        fieldRefs.current[2] = el;
                      }}
                      className="flex flex-col gap-2"
                    >
                      <label
                        htmlFor="email"
                        className={`flex items-baseline gap-2.5 text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-[var(--dur-micro)] ${fieldLabelClass("email")}`}
                      >
                        <span className="font-mono text-[11px] text-mb-blue">
                          03
                        </span>
                        Email<span className="text-mb-blue">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                        required
                        placeholder="tu@email.com"
                        className={`${inputBase} ${fieldBorderClass("email")} ${FOCUS_RING}`}
                      />
                    </div>
                  </div>

                  {/* 04 — Vehículo de interés (opcional) */}
                  <div
                    ref={(el) => {
                      fieldRefs.current[3] = el;
                    }}
                    className="flex flex-col gap-2"
                  >
                    <label
                      htmlFor="vehicle"
                      className={`flex items-baseline gap-2.5 text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-[var(--dur-micro)] ${fieldLabelClass("vehicle")}`}
                    >
                      <span className="font-mono text-[11px] text-mb-blue">
                        04
                      </span>
                      Vehículo de Interés
                    </label>
                    <input
                      type="text"
                      id="vehicle"
                      value={formData.vehicle}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("vehicle")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Ej: Clase C 2020, GLC..."
                      className={`${inputBase} ${fieldBorderClass("vehicle")} ${FOCUS_RING}`}
                    />
                  </div>

                  {/* 05 — Consulta */}
                  <div
                    ref={(el) => {
                      fieldRefs.current[4] = el;
                    }}
                    className="flex flex-col gap-2"
                  >
                    <label
                      htmlFor="message"
                      className={`flex items-baseline gap-2.5 text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-[var(--dur-micro)] ${fieldLabelClass("message")}`}
                    >
                      <span className="font-mono text-[11px] text-mb-blue">
                        05
                      </span>
                      Consulta<span className="text-mb-blue">*</span>
                    </label>
                    <textarea
                      id="message"
                      rows={3}
                      value={formData.message}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("message")}
                      onBlur={() => setFocusedField(null)}
                      required
                      placeholder="¿Qué estás buscando específicamente?"
                      className={`${inputBase} ${fieldBorderClass("message")} ${FOCUS_RING} resize-none`}
                    />
                  </div>

                  {/* Submit — CtaSweep verde (única superficie whatsapp de
                      la página, tal como manda la dirección). */}
                  <div ref={submitRef} className="pt-2">
                    <button
                      type="submit"
                      className={`group/submit relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-none border border-whatsapp bg-whatsapp px-6 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-[var(--dur-micro)] ease-[var(--ease-micro)] ${FOCUS_RING}`}
                    >
                      <span
                        aria-hidden
                        className="absolute inset-0 origin-left scale-x-0 bg-white/20 transition-transform duration-[var(--dur-element)] ease-[var(--ease-scrub)] group-hover/submit:scale-x-100"
                      />
                      <span className="relative z-10 flex items-center gap-3">
                        Consultar Disponibilidad
                        <Send
                          size={16}
                          className="transition-transform duration-[var(--dur-micro)] ease-[var(--ease-micro)] group-hover/submit:translate-x-1"
                        />
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
